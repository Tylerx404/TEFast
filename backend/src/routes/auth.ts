var express = require("express");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var crypto = require("crypto");
var helper = require("../utils/helper");
var usersModule = require("../schemas/users");
var coursesModule = require("../schemas/courses");
var checkLogin = require("../utils/authHandler").checkLogin;
var validationHandler = require("../utils/validationHandler");
var mailHandler = require("../utils/mailHandler");

var router = express.Router();
var JWT_SECRET = process.env.JWT_SECRET || "HUTECH";
var EMAIL_VERIFY_SECRET = process.env.EMAIL_VERIFY_SECRET || JWT_SECRET;
var EMAIL_VERIFY_EXPIRES_IN = process.env.EMAIL_VERIFY_EXPIRES_IN || "1d";
var courseCategories = coursesModule.courseCategories;

function createAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
}

function createEmailVerifyToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      type: "email-verify",
    },
    EMAIL_VERIFY_SECRET,
    {
      expiresIn: EMAIL_VERIFY_EXPIRES_IN,
    },
  );
}

function createForgotPasswordToken() {
  return crypto.randomBytes(32).toString("hex");
}

router.post(
  "/register",
  validationHandler.userPostValidation,
  validationHandler.validateResult,
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var body = req.body || {};
      var normalizedTargetExam =
        body.targetExam === "" ? null : body.targetExam;

      var existEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1 LIMIT 1",
        [String(body.email).toLowerCase()],
      );

      if (existEmail.rows.length > 0) {
        helper.sendError(res, 409, "Email already exists");
        return;
      }

      var passwordPayload = usersModule.userHooks.beforeSave({
        password: body.password,
      });

      var email = String(body.email).toLowerCase();
      var username = body.username || email.split("@")[0];
      var existUsername = await pool.query(
        "SELECT id FROM users WHERE username = $1 LIMIT 1",
        [username],
      );

      if (existUsername.rows.length > 0) {
        helper.sendError(res, 409, "Username already exists");
        return;
      }

      if (
        normalizedTargetExam !== undefined &&
        normalizedTargetExam !== null &&
        !courseCategories.includes(normalizedTargetExam)
      ) {
        helper.sendError(res, 422, "Validation failed", [
          {
            field: "targetExam",
            message: "Target exam must be TOEIC or IELTS",
          },
        ]);
        return;
      }

      var studentRole = await pool.query(
        "SELECT id FROM roles WHERE name = 'STUDENT' LIMIT 1",
      );

      if (studentRole.rows.length === 0) {
        helper.sendError(res, 500, "Student role is missing");
        return;
      }

      var createUserResult = await pool.query(
        `INSERT INTO users (
          username, password_hash, email, full_name, avatar_url, phone,
          role_id, status, target_exam, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'INACTIVE', $8, NOW(), NOW())
        RETURNING id, created_at`,
        [
          username,
          passwordPayload.passwordHash,
          email,
          body.fullName || "",
          body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
          body.phone || null,
          studentRole.rows[0].id,
          courseCategories.includes(normalizedTargetExam) ? normalizedTargetExam : null,
        ],
      );

      var user = {
        id: createUserResult.rows[0].id,
        fullName: body.fullName || "",
        email: email,
        role: "STUDENT",
        phone: body.phone || null,
        createdAt: createUserResult.rows[0].created_at,
      };
      var verifyEmailToken = createEmailVerifyToken(user);
      var mailResult = await mailHandler.sendVerifyEmailMail(email, verifyEmailToken);

      if (!mailResult.success) {
        console.error("verify email mail error:", mailResult.message);
        helper.sendCreated(
          res,
          "Register successful, but the verification email could not be sent right now. You can log in and resend it later.",
          {
            email: email,
            verificationEmailSent: false,
          },
        );
        return;
      }

      helper.sendCreated(
        res,
        "Register successful. You can log in right away and verify your email later if needed",
        {
          email: email,
          verificationEmailSent: true,
        },
      );
    } catch (error) {
      console.error("register error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.get(
  "/verify-email",
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var token = String(req.query.token || "").trim();

      if (!token) {
        helper.sendError(res, 400, "Verification token is required");
        return;
      }

      var decodedToken = jwt.verify(token, EMAIL_VERIFY_SECRET);

      if (
        !decodedToken ||
        typeof decodedToken === "string" ||
        decodedToken.type !== "email-verify" ||
        !decodedToken.id ||
        !decodedToken.email
      ) {
        helper.sendError(res, 400, "Verification token is invalid or has expired");
        return;
      }

      var result = await pool.query(
        `SELECT id, email, status, is_deleted
         FROM users
         WHERE id = $1 AND email = $2
         LIMIT 1`,
        [decodedToken.id, String(decodedToken.email).toLowerCase()],
      );

      if (result.rows.length === 0) {
        helper.sendError(res, 400, "Verification token is invalid or has expired");
        return;
      }

      var dbUser = result.rows[0];

      if (dbUser.is_deleted) {
        helper.sendError(res, 400, "Account is no longer available");
        return;
      }

      if (String(dbUser.status || "").toUpperCase() === "BLOCKED") {
        helper.sendError(res, 403, "Account has been blocked");
        return;
      }

      if (String(dbUser.status || "").toUpperCase() === "ACTIVE") {
        helper.sendSuccess(res, "Email already verified", null);
        return;
      }

      await pool.query(
        `UPDATE users
         SET status = 'ACTIVE',
             updated_at = NOW()
         WHERE id = $1`,
        [dbUser.id],
      );

      helper.sendSuccess(res, "Email verified successfully", null);
    } catch (error) {
      if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
        helper.sendError(res, 400, "Verification token is invalid or has expired");
        return;
      }

      console.error("verify email error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.post(
  "/resend-verification-email",
  validationHandler.forgotPasswordValidation,
  validationHandler.validateResult,
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var body = req.body || {};
      var email = String(body.email || "").toLowerCase().trim();
      var result = await pool.query(
        `SELECT id, email, status, is_deleted
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [email],
      );

      if (result.rows.length === 0) {
        helper.sendSuccess(
          res,
          "If the account exists and still needs verification, a new email has been sent",
          null,
        );
        return;
      }

      var dbUser = result.rows[0];

      if (dbUser.is_deleted || String(dbUser.status || "").toUpperCase() === "BLOCKED") {
        helper.sendSuccess(
          res,
          "If the account exists and still needs verification, a new email has been sent",
          null,
        );
        return;
      }

      if (String(dbUser.status || "").toUpperCase() === "ACTIVE") {
        helper.sendSuccess(res, "Email is already verified", null);
        return;
      }

      var verifyEmailToken = createEmailVerifyToken({
        id: dbUser.id,
        email: dbUser.email,
      });
      var mailResult = await mailHandler.sendVerifyEmailMail(dbUser.email, verifyEmailToken);

      if (!mailResult.success) {
        console.error("resend verify email error:", mailResult.message);
        helper.sendError(res, 500, "Unable to send verification email right now");
        return;
      }

      helper.sendSuccess(
        res,
        "If the account exists and still needs verification, a new email has been sent",
        null,
      );
    } catch (error) {
      console.error("resend verification email error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.post(
  "/forgot-password",
  validationHandler.forgotPasswordValidation,
  validationHandler.validateResult,
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var body = req.body || {};
      var email = String(body.email || "").toLowerCase().trim();
      var result = await pool.query(
        `SELECT id, email, status, is_deleted
         FROM users
         WHERE email = $1
         LIMIT 1`,
        [email],
      );

      if (result.rows.length === 0) {
        helper.sendSuccess(
          res,
          "If the account exists, a password reset email has been sent",
          null,
        );
        return;
      }

      var dbUser = result.rows[0];

      if (dbUser.is_deleted || String(dbUser.status || "").toUpperCase() === "BLOCKED") {
        helper.sendSuccess(
          res,
          "If the account exists, a password reset email has been sent",
          null,
        );
        return;
      }

      var forgotPasswordToken = createForgotPasswordToken();
      var forgotPasswordTokenExp = new Date(Date.now() + 1000 * 60 * 30).toISOString();

      await pool.query(
        `UPDATE users
         SET forgot_password_token = $1,
             forgot_password_token_exp = $2,
             updated_at = NOW()
         WHERE id = $3`,
        [forgotPasswordToken, forgotPasswordTokenExp, dbUser.id],
      );

      var mailResult = await mailHandler.sendForgotPasswordMail(dbUser.email, forgotPasswordToken);

      if (!mailResult.success) {
        console.error("forgot password mail error:", mailResult.message);
        helper.sendError(res, 500, "Unable to send password reset email right now");
        return;
      }

      helper.sendSuccess(
        res,
        "If the account exists, a password reset email has been sent",
        null,
      );
    } catch (error) {
      console.error("forgot password error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.post(
  "/reset-password",
  validationHandler.resetPasswordValidation,
  validationHandler.validateResult,
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var body = req.body || {};
      var token = String(body.token || "").trim();
      var result = await pool.query(
        `SELECT id
         FROM users
         WHERE forgot_password_token = $1
           AND forgot_password_token_exp IS NOT NULL
           AND forgot_password_token_exp > NOW()
           AND COALESCE(is_deleted, FALSE) = FALSE
         LIMIT 1`,
        [token],
      );

      if (result.rows.length === 0) {
        helper.sendError(res, 400, "Reset token is invalid or has expired");
        return;
      }

      var passwordPayload = usersModule.userHooks.beforeSave({
        password: body.password,
      });

      await pool.query(
        `UPDATE users
         SET password_hash = $1,
             forgot_password_token = NULL,
             forgot_password_token_exp = NULL,
             updated_at = NOW()
         WHERE id = $2`,
        [passwordPayload.passwordHash, result.rows[0].id],
      );

      helper.sendSuccess(res, "Password reset successful", null);
    } catch (error) {
      console.error("reset password error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.post(
  "/login",
  validationHandler.loginValidation,
  validationHandler.validateResult,
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var body = req.body || {};
      var email = String(body.email).toLowerCase();

      var result = await pool.query(
        `SELECT u.id, u.username, u.password_hash, u.email, u.full_name,
                u.phone, u.avatar_url, u.status, u.is_deleted, r.name AS role_name
         FROM users u
         LEFT JOIN roles r ON r.id = u.role_id
         WHERE u.email = $1
         LIMIT 1`,
        [email],
      );

      if (result.rows.length === 0) {
        helper.sendError(res, 401, "Email or password is incorrect");
        return;
      }

      var dbUser = result.rows[0];

      if (dbUser.is_deleted) {
        helper.sendError(res, 403, "Account has been deleted");
        return;
      }

      if (String(dbUser.status || "").toUpperCase() === "BLOCKED") {
        helper.sendError(res, 403, "Account has been blocked");
        return;
      }

      var isMatch = await bcrypt.compare(body.password, dbUser.password_hash);

      if (!isMatch) {
        helper.sendError(res, 401, "Email or password is incorrect");
        return;
      }

      await pool.query(
        `UPDATE users
         SET login_count = COALESCE(login_count, 0) + 1,
             last_login_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [dbUser.id],
      );

      var user = {
        id: dbUser.id,
        fullName: dbUser.full_name,
        email: dbUser.email,
        role: String(dbUser.role_name || "").toUpperCase(),
      };

      var accessToken = createAccessToken({
        id: dbUser.id,
        email: dbUser.email,
        role: String(dbUser.role_name || "").toUpperCase(),
      });

      res.cookie("token", accessToken, {
        httpOnly: true,
      });

      helper.sendSuccess(res, "Login successful", {
        user: user,
        accessToken: accessToken,
        expiresIn: 86400,
      });
    } catch (error) {
      console.error("login error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.get("/me", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.phone, u.avatar_url, u.status,
              r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND COALESCE(u.is_deleted, FALSE) = FALSE
       LIMIT 1`,
      [req.userId],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "User not found");
      return;
    }

    var row = result.rows[0];

    helper.sendSuccess(res, "Current session fetched", {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: String(row.role_name || "").toUpperCase(),
      phone: row.phone,
      avatarUrl: row.avatar_url,
      status: String(row.status || "").toUpperCase(),
    });
  } catch (error) {
    console.error("me error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post("/logout", checkLogin, function (req, res, next) {
  res.clearCookie("token");
  helper.sendSuccess(res, "Logout successful", null);
});

module.exports = router;
