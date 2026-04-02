var express = require("express");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var crypto = require("crypto");
var helper = require("../utils/helper");
var usersModule = require("../schemas/users");
var checkLogin = require("../utils/authHandler").checkLogin;
var validationHandler = require("../utils/validationHandler");

var router = express.Router();
var JWT_SECRET = process.env.JWT_SECRET || "HUTECH";
var STUDENT_ROLE_ID = "11111111-1111-1111-1111-111111111111";

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

router.post(
  "/register",
  validationHandler.userPostValidation,
  validationHandler.validateResult,
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var body = req.body || {};

      // Check email đã tồn tại chưa
      var existEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [String(body.email).toLowerCase()],
      );

      if (existEmail.rows.length > 0) {
        return res.status(409).send({
          message: "email da ton tai",
        });
      }

      // Check username đã tồn tại chưa
      if (body.username) {
        var existUsername = await pool.query(
          "SELECT id FROM users WHERE username = $1",
          [body.username],
        );

        if (existUsername.rows.length > 0) {
          return res.status(409).send({
            message: "username da ton tai",
          });
        }
      }

      // Hash password
      var passwordPayload = usersModule.userHooks.beforeSave({
        password: body.password,
      });

      var userId = crypto.randomUUID();
      var email = String(body.email).toLowerCase();
      var username = body.username || email.split("@")[0];

      await pool.query(
        `INSERT INTO users (id, username, password_hash, email, full_name, role_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE')`,
        [
          userId,
          username,
          passwordPayload.passwordHash,
          email,
          body.fullName || "",
          STUDENT_ROLE_ID,
        ],
      );

      var user = {
        id: userId,
        username: username,
        fullName: body.fullName || "",
        email: email,
        role: "STUDENT",
      };

      var accessToken = createAccessToken(user);

      res.cookie("token", accessToken, {
        httpOnly: true,
      });

      res.status(201).send({
        message: "dang ky thanh cong",
        user: user,
        accessToken: accessToken,
        expiresIn: 86400,
      });
    } catch (error) {
      console.error("register error:", error);
      res.status(500).send({
        message: "loi he thong",
      });
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
                u.status, u.is_deleted, r.name AS role_name
         FROM users u
         LEFT JOIN roles r ON r.id = u.role_id
         WHERE u.email = $1
         LIMIT 1`,
        [email],
      );

      if (result.rows.length === 0) {
        return res.status(401).send({
          message: "email hoac password khong dung",
        });
      }

      var dbUser = result.rows[0];

      if (dbUser.is_deleted) {
        return res.status(403).send({
          message: "tai khoan da bi xoa",
        });
      }

      if (dbUser.status === "BLOCKED") {
        return res.status(403).send({
          message: "tai khoan da bi khoa",
        });
      }

      // So sánh password
      var isMatch = await bcrypt.compare(body.password, dbUser.password_hash);

      if (!isMatch) {
        return res.status(401).send({
          message: "email hoac password khong dung",
        });
      }

      // Cập nhật login_count và last_login_at
      await pool.query(
        `UPDATE users SET login_count = login_count + 1, last_login_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [dbUser.id],
      );

      var user = {
        id: dbUser.id,
        username: dbUser.username,
        fullName: dbUser.full_name,
        email: dbUser.email,
        role: dbUser.role_name,
      };

      var accessToken = createAccessToken(user);

      res.cookie("token", accessToken, {
        httpOnly: true,
      });

      res.send({
        message: "dang nhap thanh cong",
        user: user,
        accessToken: accessToken,
        expiresIn: 86400,
      });
    } catch (error) {
      console.error("login error:", error);
      res.status(500).send({
        message: "loi he thong",
      });
    }
  },
);

router.get("/me", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.avatar_url,
              u.phone, u.target_exam, u.status, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.is_deleted = FALSE
       LIMIT 1`,
      [req.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({
        message: "khong tim thay user",
      });
    }

    var row = result.rows[0];

    res.send({
      message: "lay thong tin thanh cong",
      user: {
        id: row.id,
        username: row.username,
        fullName: row.full_name,
        email: row.email,
        role: row.role_name,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        targetExam: row.target_exam,
      },
    });
  } catch (error) {
    console.error("me error:", error);
    res.status(500).send({
      message: "loi he thong",
    });
  }
});

router.post("/logout", function (req, res, next) {
  res.clearCookie("token");
  res.send({
    message: "dang xuat thanh cong",
  });
});

module.exports = router;
