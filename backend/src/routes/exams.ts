var express = require("express");
var helper = require("../utils/helper");
var examsModule = require("../schemas/exams");
var coursesModule = require("../schemas/courses");
var questionsModule = require("../schemas/questions");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var examTypes = examsModule.examTypes;
var courseCategories = coursesModule.courseCategories;
var questionSections = questionsModule.questionSections;
var checkLogin = authHandler.checkLogin;
var checkRole = authHandler.checkRole;

async function findExamById(req, examId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    `SELECT id, course_id, teacher_id, duration_minutes, is_published
     FROM exams
     WHERE id = $1
     LIMIT 1`,
    [examId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

function isExamVisibleToUser(exam, currentUser) {
  if (!exam) {
    return false;
  }

  if (exam.is_published) {
    return true;
  }

  if (!currentUser) {
    return false;
  }

  return (
    currentUser.role.name === "ADMIN" ||
    exam.teacher_id === currentUser.id
  );
}

async function findCourseById(req, courseId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    "SELECT id, teacher_id FROM courses WHERE id = $1 LIMIT 1",
    [courseId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function ensureCourseOwnerOrAdmin(req, res, courseId) {
  var course = await findCourseById(req, courseId);

  if (!course) {
    helper.sendError(res, 404, "Course not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    course.teacher_id === req.currentUser.id
  ) {
    return course;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

async function ensureExamOwnerOrAdmin(req, res, examId) {
  var exam = await findExamById(req, examId);

  if (!exam) {
    helper.sendError(res, 404, "Exam not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    exam.teacher_id === req.currentUser.id
  ) {
    return exam;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

async function canAccessExamQuestions(req, exam) {
  var pool = req.app.locals.pg;
  var sessionResult;

  if (
    req.currentUser.role.name === "ADMIN" ||
    exam.teacher_id === req.currentUser.id
  ) {
    return true;
  }

  sessionResult = await pool.query(
    `SELECT id
     FROM exam_sessions
     WHERE exam_id = $1
       AND user_id = $2
     ORDER BY started_at DESC
     LIMIT 1`,
    [exam.id, req.currentUser.id],
  );

  return sessionResult.rows.length > 0;
}

router.get("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var currentUser = await authHandler.tryLoadCurrentUser(req);
    var pageLimit = helper.readPagination(req.query);
    var page = pageLimit.page;
    var limit = pageLimit.limit;
    var offset = (page - 1) * limit;
    var conditions: string[] = [];
    var values: any[] = [];
    var idx = 1;
    var whereClause;
    var countResult;
    var total;
    var result;
    var exams;

    if (req.query.category && courseCategories.includes(req.query.category)) {
      conditions.push("e.category = $" + idx++);
      values.push(req.query.category);
    }

    if (req.query.examType && examTypes.includes(req.query.examType)) {
      conditions.push("e.exam_type = $" + idx++);
      values.push(req.query.examType);
    }

    if (req.query.courseId) {
      conditions.push("e.course_id = $" + idx++);
      values.push(req.query.courseId);
    }

    if (req.query.keyword) {
      conditions.push("e.title ILIKE $" + idx++);
      values.push("%" + req.query.keyword + "%");
    }

    if (!currentUser || currentUser.role.name === "STUDENT") {
      conditions.push("e.is_published = TRUE");
    } else if (currentUser.role.name === "TEACHER") {
      conditions.push("(e.is_published = TRUE OR e.teacher_id = $" + idx++ + ")");
      values.push(currentUser.id);
    }

    whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    countResult = await pool.query(
      `SELECT COUNT(*) FROM exams e ${whereClause}`,
      values,
    );
    total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    result = await pool.query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS total_questions
       FROM exams e
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    exams = result.rows.map(function (row) {
      return {
        id: row.id,
        courseId: row.course_id,
        title: row.title,
        category: row.category,
        examType: row.exam_type,
        durationMinutes: row.duration_minutes,
        totalQuestions: parseInt(row.total_questions, 10),
        isPublished: row.is_published,
      };
    });

    helper.sendSuccess(
      res,
      "Exams fetched",
      exams,
      helper.buildPaginationMeta(page, limit, total),
    );
  } catch (error) {
    console.error("list exams error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post("/", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var course;
    var result;
    var row;

    if (
      !body.courseId ||
      !body.title ||
      !body.category ||
      !body.examType ||
      !body.durationMinutes
    ) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "courseId",
          message: "courseId, title, category, examType and durationMinutes are required",
        },
      ]);
      return;
    }

    if (!courseCategories.includes(body.category)) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "category",
          message: "Category must be TOEIC or IELTS",
        },
      ]);
      return;
    }

    if (!examTypes.includes(body.examType)) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "examType",
          message: "Exam type is invalid",
        },
      ]);
      return;
    }

    course = await ensureCourseOwnerOrAdmin(req, res, body.courseId);

    if (!course) {
      return;
    }

    result = await pool.query(
      `INSERT INTO exams (
        course_id, teacher_id, title, category, exam_type, duration_minutes,
        instructions, is_published, published_at, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, CASE WHEN $8 = TRUE THEN NOW() ELSE NULL END, NOW(), NOW()
      )
      RETURNING *`,
      [
        body.courseId,
        req.currentUser.id,
        body.title,
        body.category,
        body.examType,
        body.durationMinutes,
        body.instructions || null,
        body.isPublished === true,
      ],
    );

    row = result.rows[0];

    helper.sendCreated(res, "Exam created", {
      id: row.id,
      courseId: row.course_id,
      title: row.title,
    });
  } catch (error) {
    console.error("create exam error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post("/:id/start", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var exam = await findExamById(req, req.params.id);
    var startedAt;
    var expiresAt;
    var sessionResult;

    if (!exam) {
      helper.sendError(res, 404, "Exam not found");
      return;
    }

    if (!isExamVisibleToUser(exam, req.currentUser)) {
      helper.sendError(res, 404, "Exam not found");
      return;
    }

    startedAt = new Date();
    expiresAt = new Date(
      startedAt.getTime() + Number(exam.duration_minutes || 0) * 60 * 1000,
    );

    sessionResult = await pool.query(
      `INSERT INTO exam_sessions (
        exam_id, user_id, device, timezone,
        started_at, expires_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id`,
      [
        req.params.id,
        req.currentUser.id,
        body.device || null,
        body.timezone || null,
        startedAt.toISOString(),
        expiresAt.toISOString(),
      ],
    );

    helper.sendSuccess(res, "Exam session started", {
      examSessionId: sessionResult.rows[0].id,
      examId: req.params.id,
      startedAt: startedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("start exam error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.get("/:examId/questions", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var exam = await findExamById(req, req.params.examId);
    var result;
    var questions;

    if (!exam) {
      helper.sendError(res, 404, "Exam not found");
      return;
    }

    if (!(await canAccessExamQuestions(req, exam))) {
      helper.sendError(res, 403, "Forbidden");
      return;
    }

    result = await pool.query(
      `SELECT *
       FROM questions
       WHERE exam_id = $1
       ORDER BY order_index ASC, created_at ASC`,
      [req.params.examId],
    );

    questions = result.rows.map(function (row) {
      return {
        id: row.id,
        examId: row.exam_id,
        section: row.section,
        content: row.content,
        options: row.options,
        orderIndex: row.order_index,
        audioUrl: row.audio_url,
        imageUrl: row.image_url,
      };
    });

    helper.sendSuccess(res, "Questions fetched", questions);
  } catch (error) {
    console.error("list exam questions error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post(
  "/:examId/questions",
  checkLogin,
  checkRole("TEACHER", "ADMIN"),
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var body = req.body || {};
      var exam = await ensureExamOwnerOrAdmin(req, res, req.params.examId);
      var result;
      var row;

      if (!exam) {
        return;
      }

      if (
        !body.section ||
        !body.content ||
        !Array.isArray(body.options) ||
        body.correctAnswer === undefined ||
        body.orderIndex === undefined
      ) {
        helper.sendError(res, 400, "Validation failed", [
          {
            field: "section",
            message: "section, content, options, correctAnswer and orderIndex are required",
          },
        ]);
        return;
      }

      if (!questionSections.includes(body.section)) {
        helper.sendError(res, 422, "Validation failed", [
          {
            field: "section",
            message: "Question section is invalid",
          },
        ]);
        return;
      }

      result = await pool.query(
        `INSERT INTO questions (
          exam_id, section, content, options, correct_answer,
          explanation, order_index, audio_url, image_url, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *`,
        [
          req.params.examId,
          body.section,
          body.content,
          JSON.stringify(body.options),
          JSON.stringify(body.correctAnswer),
          body.explanation || null,
          body.orderIndex,
          body.audioUrl || null,
          body.imageUrl || null,
        ],
      );

      row = result.rows[0];

      helper.sendCreated(res, "Question created", {
        id: row.id,
        examId: row.exam_id,
        orderIndex: row.order_index,
      });
    } catch (error) {
      console.error("create exam question error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.get(
  "/:examId/results",
  checkLogin,
  checkRole("TEACHER", "ADMIN"),
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var pageLimit = helper.readPagination(req.query);
      var page = pageLimit.page;
      var limit = pageLimit.limit;
      var offset = (page - 1) * limit;
      var exam = await ensureExamOwnerOrAdmin(req, res, req.params.examId);
      var values: any[] = [req.params.examId];
      var idx = 2;
      var whereClause = "er.exam_id = $1";
      var countResult;
      var total;
      var result;
      var results;

      if (!exam) {
        return;
      }

      if (req.query.userId) {
        whereClause += " AND er.user_id = $" + idx++;
        values.push(req.query.userId);
      }

      countResult = await pool.query(
        `SELECT COUNT(*) FROM exam_results er WHERE ${whereClause}`,
        values,
      );
      total = parseInt(countResult.rows[0].count, 10);

      values.push(limit, offset);
      result = await pool.query(
        `SELECT er.id, er.score, er.submitted_at, u.id AS user_id, u.full_name
         FROM exam_results er
         LEFT JOIN users u ON u.id = er.user_id
         WHERE ${whereClause}
         ORDER BY er.submitted_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        values,
      );

      results = result.rows.map(function (row) {
        return {
          id: row.id,
          user: {
            id: row.user_id,
            fullName: row.full_name,
          },
          score: parseFloat(row.score),
          submittedAt: row.submitted_at,
        };
      });

      helper.sendSuccess(
        res,
        "Exam results fetched",
        results,
        helper.buildPaginationMeta(page, limit, total),
      );
    } catch (error) {
      console.error("list exam results error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.get("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var currentUser = await authHandler.tryLoadCurrentUser(req);
    var result;
    var row;

    result = await pool.query(
      `SELECT e.*,
              (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS total_questions
       FROM exams e
       WHERE e.id = $1
       LIMIT 1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Exam not found");
      return;
    }

    row = result.rows[0];

    if (!isExamVisibleToUser(row, currentUser)) {
      helper.sendError(res, 404, "Exam not found");
      return;
    }

    helper.sendSuccess(res, "Exam fetched", {
      id: row.id,
      courseId: row.course_id,
      title: row.title,
      category: row.category,
      examType: row.exam_type,
      durationMinutes: row.duration_minutes,
      totalQuestions: parseInt(row.total_questions, 10),
      instructions: row.instructions,
      isPublished: row.is_published,
    });
  } catch (error) {
    console.error("get exam error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var exam = await ensureExamOwnerOrAdmin(req, res, req.params.id);
    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;
    var result;
    var row;

    if (!exam) {
      return;
    }

    if (body.category !== undefined && !courseCategories.includes(body.category)) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "category",
          message: "Category must be TOEIC or IELTS",
        },
      ]);
      return;
    }

    if (body.examType !== undefined && !examTypes.includes(body.examType)) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "examType",
          message: "Exam type is invalid",
        },
      ]);
      return;
    }

    if (body.title !== undefined) {
      fields.push("title = $" + idx++);
      values.push(body.title);
    }

    if (body.category !== undefined) {
      fields.push("category = $" + idx++);
      values.push(body.category);
    }

    if (body.examType !== undefined) {
      fields.push("exam_type = $" + idx++);
      values.push(body.examType);
    }

    if (body.durationMinutes !== undefined) {
      fields.push("duration_minutes = $" + idx++);
      values.push(body.durationMinutes);
    }

    if (body.instructions !== undefined) {
      fields.push("instructions = $" + idx++);
      values.push(body.instructions);
    }

    if (body.isPublished !== undefined) {
      fields.push("is_published = $" + idx++);
      values.push(body.isPublished === true);
      if (body.isPublished === true) {
        fields.push("published_at = NOW()");
      } else {
        fields.push("published_at = NULL");
      }
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
    values.push(req.params.id);

    result = await pool.query(
      `UPDATE exams SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Exam not found");
      return;
    }

    row = result.rows[0];

    helper.sendSuccess(res, "Exam updated", {
      id: row.id,
      durationMinutes: row.duration_minutes,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("update exam error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.delete("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var exam = await ensureExamOwnerOrAdmin(req, res, req.params.id);
    var result;

    if (!exam) {
      return;
    }

    result = await pool.query(
      "DELETE FROM exams WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Exam not found");
      return;
    }

    helper.sendSuccess(res, "Exam deleted", {
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("delete exam error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
