var express = require("express");
var crypto = require("crypto");
var helper = require("../utils/helper");
var enrollmentsModule = require("../schemas/enrollments");

var router = express.Router();
var enrollmentStatuses = enrollmentsModule.enrollmentStatuses;

router.get("/my", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var { page, limit } = helper.readPagination(req.query);
    var offset = (page - 1) * limit;
    var userId = req.userId;

    var conditions = ["e.user_id = $1"];
    var values = [userId];
    var idx = 2;

    if (req.query.status && enrollmentStatuses.includes(req.query.status)) {
      conditions.push("e.status = $" + idx++);
      values.push(req.query.status);
    }

    var whereClause = conditions.join(" AND ");

    var countResult = await pool.query(
      `SELECT COUNT(*) FROM enrollments e WHERE ${whereClause}`,
      values,
    );
    var total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    var result = await pool.query(
      `SELECT e.*, c.title AS course_title
       FROM enrollments e
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE ${whereClause}
       ORDER BY e.enrolled_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    var enrollments = result.rows.map(function (row) {
      return {
        id: row.id,
        courseId: row.course_id,
        courseTitle: row.course_title,
        userId: row.user_id,
        status: row.status,
        progressPercent: parseFloat(row.progress_percent),
        lastLessonId: row.last_lesson_id,
        enrolledAt: row.enrolled_at,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.send({
      message: "lay danh sach dang ky cua toi thanh cong",
      enrollments: enrollments,
      pagination: helper.buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error("list my enrollments error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.post("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

    if (!body.courseId) {
      return res.status(400).send({ message: "courseId la bat buoc" });
    }

    var userId = body.userId || req.userId;

    // Kiểm tra đã enroll chưa
    var existEnroll = await pool.query(
      "SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2",
      [body.courseId, userId],
    );

    if (existEnroll.rows.length > 0) {
      return res.status(409).send({ message: "da dang ky khoa hoc nay roi" });
    }

    var enrollId = crypto.randomUUID();

    var result = await pool.query(
      `INSERT INTO enrollments (id, course_id, user_id, status, progress_percent, enrolled_at)
       VALUES ($1, $2, $3, 'ACTIVE', 0, NOW())
       RETURNING *`,
      [enrollId, body.courseId, userId],
    );

    var row = result.rows[0];

    res.status(201).send({
      message: "dang ky khoa hoc thanh cong",
      enrollment: {
        id: row.id,
        courseId: row.course_id,
        userId: row.user_id,
        status: row.status,
        progressPercent: parseFloat(row.progress_percent),
        enrolledAt: row.enrolled_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("create enrollment error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.patch("/:id/progress", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var status = body.status || "ACTIVE";

    if (!enrollmentStatuses.includes(status)) {
      return res.status(422).send({ message: "status khong hop le" });
    }

    var fields = ["status = $1", "updated_at = NOW()"];
    var values = [status];
    var idx = 2;

    if (body.progressPercent !== undefined) {
      fields.push("progress_percent = $" + idx++);
      values.push(body.progressPercent);
    }
    if (body.lastLessonId !== undefined) {
      fields.push("last_lesson_id = $" + idx++);
      values.push(body.lastLessonId);
    }
    if (status === "COMPLETED") {
      fields.push("completed_at = NOW()");
    }

    values.push(req.params.id);

    var result = await pool.query(
      `UPDATE enrollments SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING id, progress_percent, last_lesson_id, status`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay enrollment" });
    }

    var row = result.rows[0];

    res.send({
      message: "cap nhat tien do thanh cong",
      enrollment: {
        id: row.id,
        progressPercent: parseFloat(row.progress_percent),
        lastLessonId: row.last_lesson_id,
        status: row.status,
      },
    });
  } catch (error) {
    console.error("update enrollment progress error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT e.*, c.title AS course_title
       FROM enrollments e
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE e.id = $1
       LIMIT 1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay enrollment" });
    }

    var row = result.rows[0];

    res.send({
      id: row.id,
      courseId: row.course_id,
      courseTitle: row.course_title,
      userId: row.user_id,
      status: row.status,
      progressPercent: parseFloat(row.progress_percent),
      lastLessonId: row.last_lesson_id,
      enrolledAt: row.enrolled_at,
      completedAt: row.completed_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("get enrollment error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

module.exports = router;
