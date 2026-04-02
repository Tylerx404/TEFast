var express = require("express");
var helper = require("../utils/helper");
var usersModule = require("../schemas/users");
var rolesModule = require("../schemas/roles");
var checkLogin = require("../utils/authHandler").checkLogin;

var router = express.Router();
var userStatuses = usersModule.userStatuses;
var roleNames = rolesModule.roleNames;

router.get("/profile", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.phone,
              u.avatar_url, u.target_exam, r.name AS role_name
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
      message: "lay profile thanh cong",
      user: {
        id: row.id,
        username: row.username,
        fullName: row.full_name,
        email: row.email,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        targetExam: row.target_exam,
      },
    });
  } catch (error) {
    console.error("get profile error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.patch("/profile", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

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
      fields.push("target_exam = $" + idx++);
      values.push(body.targetExam);
    }

    if (fields.length === 0) {
      return res.status(400).send({
        message: "khong co du lieu de cap nhat",
      });
    }

    fields.push("updated_at = NOW()");
    values.push(req.userId);

    var result = await pool.query(
      `UPDATE users SET ${fields.join(", ")}
       WHERE id = $${idx} AND is_deleted = FALSE
       RETURNING id, full_name, phone, avatar_url, target_exam, updated_at`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).send({
        message: "khong tim thay user",
      });
    }

    var row = result.rows[0];

    res.send({
      message: "cap nhat profile thanh cong",
      user: {
        id: row.id,
        fullName: row.full_name,
        phone: row.phone,
        avatarUrl: row.avatar_url,
        targetExam: row.target_exam,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("update profile error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var { page, limit } = helper.readPagination(req.query);
    var offset = (page - 1) * limit;

    var conditions = ["u.is_deleted = FALSE"];
    var values: any[] = [];
    var idx = 1;

    if (req.query.role && roleNames.includes(req.query.role)) {
      conditions.push("r.name = $" + idx++);
      values.push(req.query.role);
    }
    if (req.query.status && userStatuses.includes(req.query.status)) {
      conditions.push("u.status = $" + idx++);
      values.push(req.query.status);
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
      `SELECT COUNT(*) FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE ${whereClause}`,
      values,
    );
    var total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    var result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.avatar_url,
              u.status, u.target_exam, r.name AS role_name,
              u.created_at, u.updated_at
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
        username: row.username,
        fullName: row.full_name,
        email: row.email,
        role: row.role_name,
        avatarUrl: row.avatar_url,
        targetExam: row.target_exam,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.send({
      message: "lay danh sach user thanh cong",
      users: users,
      pagination: helper.buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error("list users error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.patch("/:id/role", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var role = req.body && req.body.role;

    if (!role || !roleNames.includes(role)) {
      return res.status(422).send({
        message: "role khong hop le",
      });
    }

    // Lấy role_id từ tên role
    var roleResult = await pool.query(
      "SELECT id FROM roles WHERE name = $1",
      [role],
    );

    if (roleResult.rows.length === 0) {
      return res.status(422).send({
        message: "role khong hop le",
      });
    }

    var result = await pool.query(
      `UPDATE users SET role_id = $1, updated_at = NOW()
       WHERE id = $2 AND is_deleted = FALSE
       RETURNING id, updated_at`,
      [roleResult.rows[0].id, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({
        message: "khong tim thay user",
      });
    }

    res.send({
      message: "cap nhat role thanh cong",
      user: {
        id: result.rows[0].id,
        role: role,
        updatedAt: result.rows[0].updated_at,
      },
    });
  } catch (error) {
    console.error("update role error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.avatar_url,
              u.status, u.target_exam, r.name AS role_name,
              u.created_at, u.updated_at
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1 AND u.is_deleted = FALSE
       LIMIT 1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({
        message: "khong tim thay user",
      });
    }

    var row = result.rows[0];

    res.send({
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      role: row.role_name,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      targetExam: row.target_exam,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("get user error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

module.exports = router;
