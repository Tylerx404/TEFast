var express = require("express");
var helper = require("../utils/helper");
var usersModule = require("../schemas/users");
var rolesModule = require("../schemas/roles");
var coursesModule = require("../schemas/courses");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var userStatuses = usersModule.userStatuses;
var roleNames = rolesModule.roleNames;
var checkLogin = authHandler.checkLogin;
var checkRole = authHandler.checkRole;

router.get("/profile", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url, u.target_exam
       FROM users u
       WHERE u.id = $1 AND COALESCE(u.is_deleted, FALSE) = FALSE
       LIMIT 1`,
      [req.userId],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "User not found");
      return;
    }

    var row = result.rows[0];

    helper.sendSuccess(res, "Profile fetched", {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      targetExam: row.target_exam,
    });
  } catch (error) {
    console.error("get profile error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/profile", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var normalizedTargetExam =
      body.targetExam === "" ? null : body.targetExam;

    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;

    if (body.fullName !== undefined) {
      fields.push("full_name = $" + idx++);
      values.push(body.fullName);
    }
    if (body.phone !== undefined) {
      fields.push("phone = $" + idx++);
      values.push(body.phone);
    }
    if (body.avatarUrl !== undefined) {
      fields.push("avatar_url = $" + idx++);
      values.push(body.avatarUrl);
    }
    if (body.targetExam !== undefined) {
      if (
        normalizedTargetExam !== null &&
        !coursesModule.courseCategories.includes(normalizedTargetExam)
      ) {
        helper.sendError(res, 422, "Validation failed", [
          {
            field: "targetExam",
            message: "Target exam must be TOEIC or IELTS",
          },
        ]);
        return;
      }

      fields.push("target_exam = $" + idx++);
      values.push(normalizedTargetExam);
    }

    if (fields.length === 0) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "body",
          message: "No data to update",
        },
      ]);
      return;
    }

    fields.push("updated_at = NOW()");
    values.push(req.userId);

    var result = await pool.query(
      `UPDATE users SET ${fields.join(", ")}
       WHERE id = $${idx} AND COALESCE(is_deleted, FALSE) = FALSE
       RETURNING id, full_name, phone, avatar_url, target_exam, updated_at`,
      values,
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "User not found");
      return;
    }

    var row = result.rows[0];

    helper.sendSuccess(res, "Profile updated", {
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      targetExam: row.target_exam,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("update profile error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.get("/", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var pageLimit = helper.readPagination(req.query);
    var page = pageLimit.page;
    var limit = pageLimit.limit;
    var offset = (page - 1) * limit;

    var conditions = ["COALESCE(u.is_deleted, FALSE) = FALSE"];
    var values: any[] = [];
    var idx = 1;

    if (req.query.role && roleNames.includes(req.query.role)) {
      conditions.push("r.name = $" + idx++);
      values.push(String(req.query.role).toUpperCase());
    }
    if (req.query.status && userStatuses.includes(req.query.status)) {
      conditions.push("u.status = $" + idx++);
      values.push(String(req.query.status).toUpperCase());
    }
    if (req.query.keyword) {
      conditions.push(
        "(u.full_name ILIKE $" + idx + " OR u.email ILIKE $" + idx + ")",
      );
      values.push("%" + req.query.keyword + "%");
      idx++;
    }

    var whereClause = conditions.join(" AND ");

    var countResult = await pool.query(
      `SELECT COUNT(*) FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE ${whereClause}`,
      values,
    );
    var total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    var result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.avatar_url, u.status,
              u.created_at, u.updated_at, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    var users = result.rows.map(function (row) {
      return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: String(row.role_name || "").toUpperCase(),
        status: String(row.status || "").toUpperCase(),
        avatarUrl: row.avatar_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    helper.sendSuccess(
      res,
      "Users fetched",
      users,
      helper.buildPaginationMeta(page, limit, total),
    );
  } catch (error) {
    console.error("list users error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch(
  "/:id/role",
  checkLogin,
  checkRole("ADMIN"),
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var role = req.body && req.body.role;

      if (!role || !roleNames.includes(role)) {
        helper.sendError(res, 422, "Validation failed", [
          {
            field: "role",
            message: "Role must be STUDENT, TEACHER or ADMIN",
          },
        ]);
        return;
      }

      var roleResult = await pool.query(
        "SELECT id FROM roles WHERE name = $1 LIMIT 1",
        [String(role).toUpperCase()],
      );

      if (roleResult.rows.length === 0) {
        helper.sendError(res, 422, "Validation failed", [
          {
            field: "role",
            message: "Role does not exist",
          },
        ]);
        return;
      }

      var result = await pool.query(
        `UPDATE users SET role_id = $1, updated_at = NOW()
         WHERE id = $2 AND COALESCE(is_deleted, FALSE) = FALSE
         RETURNING id, updated_at`,
        [roleResult.rows[0].id, req.params.id],
      );

      if (result.rows.length === 0) {
        helper.sendError(res, 404, "User not found");
        return;
      }

      helper.sendSuccess(res, "User role updated", {
        id: result.rows[0].id,
        role: role,
        updatedAt: result.rows[0].updated_at,
      });
    } catch (error) {
      console.error("update role error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.get("/:id", checkLogin, checkRole("ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.avatar_url,
              u.status, u.created_at, u.updated_at, r.name AS role_name
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND COALESCE(u.is_deleted, FALSE) = FALSE
       LIMIT 1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "User not found");
      return;
    }

    var row = result.rows[0];

    helper.sendSuccess(res, "User fetched", {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: String(row.role_name || "").toUpperCase(),
      phone: row.phone,
      avatarUrl: row.avatar_url,
      status: String(row.status || "").toUpperCase(),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("get user error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
