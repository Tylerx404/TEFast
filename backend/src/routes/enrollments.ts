var express = require("express");
var helper = require("../utils/helper");
var enrollmentsModule = require("../schemas/enrollments");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var enrollmentStatuses = enrollmentsModule.enrollmentStatuses;
var checkLogin = authHandler.checkLogin;
var checkRole = authHandler.checkRole;

function readEnrollmentProgress(row) {
  if (row.progress_percent !== undefined && row.progress_percent !== null) {
    return parseFloat(row.progress_percent);
  }

  return 0;
}

async function findEnrollmentById(req, enrollmentId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    `SELECT e.*, c.teacher_id
     FROM enrollments e
     LEFT JOIN courses c ON c.id = e.course_id
     WHERE e.id = $1
     LIMIT 1`,
    [enrollmentId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function ensureEnrollmentAccess(req, res, enrollmentId) {
  var enrollment = await findEnrollmentById(req, enrollmentId);

  if (!enrollment) {
    helper.sendError(res, 404, "Enrollment not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    enrollment.user_id === req.currentUser.id ||
    enrollment.teacher_id === req.currentUser.id
  ) {
    return enrollment;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

router.get("/my", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var pageLimit = helper.readPagination(req.query);
    var page = pageLimit.page;
    var limit = pageLimit.limit;
    var offset = (page - 1) * limit;
    var values: any[] = [req.userId];
    var idx = 2;
    var conditions: string[] = ["e.user_id = $1"];
    var whereClause;
    var countResult;
    var total;
    var result;
    var enrollments;

    if (
      req.query.status &&
      enrollmentStatuses.includes(String(req.query.status).toUpperCase())
    ) {
      conditions.push("e.status = $" + idx++);
      values.push(String(req.query.status).toUpperCase());
    }

    if (req.query.category) {
      conditions.push("c.category = $" + idx++);
      values.push(req.query.category);
    }

    whereClause = conditions.join(" AND ");

    countResult = await pool.query(
      `SELECT COUNT(*)
       FROM enrollments e
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE ${whereClause}`,
      values,
    );
    total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    result = await pool.query(
      `SELECT e.*, c.title AS course_title
       FROM enrollments e
       LEFT JOIN courses c ON c.id = e.course_id
       WHERE ${whereClause}
       ORDER BY e.enrolled_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    enrollments = result.rows.map(function (row) {
      return {
        id: row.id,
        courseId: row.course_id,
        courseTitle: row.course_title,
        progressPercent: readEnrollmentProgress(row),
        lastLessonId: row.last_lesson_id,
        status: row.status,
      };
    });

    helper.sendSuccess(
      res,
      "My enrollments fetched",
      enrollments,
      helper.buildPaginationMeta(page, limit, total),
    );
  } catch (error) {
    console.error("list my enrollments error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post("/", checkLogin, checkRole("STUDENT", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var existEnroll;
    var result;
    var row;

    if (!body.courseId) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "courseId",
          message: "Course id is required",
        },
      ]);
      return;
    }

    existEnroll = await pool.query(
      "SELECT id FROM enrollments WHERE course_id = $1 AND user_id = $2 LIMIT 1",
      [body.courseId, req.userId],
    );

    if (existEnroll.rows.length > 0) {
      helper.sendError(res, 409, "Enrollment already exists");
      return;
    }

    result = await pool.query(
      `INSERT INTO enrollments (
        course_id, user_id, status, progress_percent,
        enrolled_at, created_at, updated_at
      )
      VALUES ($1, $2, 'ACTIVE', 0, NOW(), NOW(), NOW())
      RETURNING *`,
      [body.courseId, req.userId],
    );

    row = result.rows[0];

    helper.sendCreated(res, "Enrollment created", {
      id: row.id,
      courseId: row.course_id,
      userId: row.user_id,
      status: row.status,
      progressPercent: readEnrollmentProgress(row),
      enrolledAt: row.enrolled_at,
    });
  } catch (error) {
    console.error("create enrollment error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id/progress", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var status = body.status || "ACTIVE";
    var enrollment = await ensureEnrollmentAccess(req, res, req.params.id);
    var fields: string[] = ["status = $1", "updated_at = NOW()"];
    var values: any[] = [String(status).toUpperCase()];
    var idx = 2;
    var result;
    var row;

    if (!enrollment) {
      return;
    }

    if (!enrollmentStatuses.includes(String(status).toUpperCase())) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "status",
          message: "Enrollment status is invalid",
        },
      ]);
      return;
    }

    if (String(status).toUpperCase() === "CANCELLED") {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "status",
          message: "Enrollment status is invalid",
        },
      ]);
      return;
    }

    if (body.progressPercent !== undefined) {
      fields.push("progress_percent = $" + idx++);
      values.push(body.progressPercent);
    }

    if (body.lastLessonId !== undefined) {
      fields.push("last_lesson_id = $" + idx++);
      values.push(body.lastLessonId);
    }

    if (String(status).toUpperCase() === "COMPLETED") {
      fields.push("completed_at = NOW()");
    } else {
      fields.push("completed_at = NULL");
    }

    values.push(req.params.id);

    result = await pool.query(
      `UPDATE enrollments SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING id, progress_percent, last_lesson_id, status`,
      values,
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Enrollment not found");
      return;
    }

    row = result.rows[0];

    helper.sendSuccess(res, "Enrollment progress updated", {
      id: row.id,
      progressPercent: readEnrollmentProgress(row),
      lastLessonId: row.last_lesson_id,
      status: row.status,
    });
  } catch (error) {
    console.error("update enrollment progress error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.get("/:id", checkLogin, async function (req, res, next) {
  try {
    var enrollment = await ensureEnrollmentAccess(req, res, req.params.id);

    if (!enrollment) {
      return;
    }

    helper.sendSuccess(res, "Enrollment fetched", {
      id: enrollment.id,
      courseId: enrollment.course_id,
      userId: enrollment.user_id,
      status: enrollment.status,
      progressPercent: readEnrollmentProgress(enrollment),
      enrolledAt: enrollment.enrolled_at,
      completedAt: enrollment.completed_at,
    });
  } catch (error) {
    console.error("get enrollment error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
