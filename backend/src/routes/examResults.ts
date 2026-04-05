var express = require("express");
var helper = require("../utils/helper");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var checkLogin = authHandler.checkLogin;
var examResultPublicSlugSql = "'result-' || encode(gen_random_bytes(12), 'hex')";

function normalizeValue(value) {
  var keys;
  var result: any;
  var i;
  var key;

  if (Array.isArray(value)) {
    return value
      .map(function (item) {
        return normalizeValue(item);
      })
      .sort(function (left, right) {
        return JSON.stringify(left).localeCompare(JSON.stringify(right));
      });
  }

  if (value && typeof value === "object") {
    keys = Object.keys(value).sort();
    result = {};

    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      result[key] = normalizeValue(value[key]);
    }

    return result;
  }

  return value;
}

function isSameAnswer(left, right) {
  return JSON.stringify(normalizeValue(left)) === JSON.stringify(normalizeValue(right));
}

async function ensureExamResultPublicSlugs(req) {
  var app = req.app;

  if (!app.locals.examResultPublicSlugSetupPromise) {
    app.locals.examResultPublicSlugSetupPromise = (async function () {
      var pool = app.locals.pg;

      await pool.query(
        `ALTER TABLE exam_results
         ADD COLUMN IF NOT EXISTS public_slug VARCHAR(40)`,
      );
      await pool.query(
        `ALTER TABLE exam_results
         ALTER COLUMN public_slug SET DEFAULT ${examResultPublicSlugSql}`,
      );
      await pool.query(
        `UPDATE exam_results
         SET public_slug = ${examResultPublicSlugSql}
         WHERE public_slug IS NULL OR public_slug = ''`,
      );
      await pool.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS exam_results_public_slug_key
         ON exam_results (public_slug)`,
      );
    })().catch(function (error) {
      app.locals.examResultPublicSlugSetupPromise = null;
      throw error;
    });
  }

  await app.locals.examResultPublicSlugSetupPromise;
}

async function findExamResultById(req, resultId) {
  await ensureExamResultPublicSlugs(req);
  var pool = req.app.locals.pg;
  var result = await pool.query(
    `SELECT er.*, e.teacher_id, e.title AS exam_title
     FROM exam_results er
     LEFT JOIN exams e ON e.id = er.exam_id
     WHERE er.id::text = $1 OR er.public_slug = $1
     LIMIT 1`,
    [resultId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function ensureExamResultViewAccess(req, res, examResultId) {
  var examResult = await findExamResultById(req, examResultId);

  if (!examResult) {
    helper.sendError(res, 404, "Exam result not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    examResult.user_id === req.currentUser.id ||
    examResult.teacher_id === req.currentUser.id
  ) {
    return examResult;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

async function ensureExamResultReviewAccess(req, res, examResultId) {
  var examResult = await findExamResultById(req, examResultId);

  if (!examResult) {
    helper.sendError(res, 404, "Exam result not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    examResult.teacher_id === req.currentUser.id
  ) {
    return examResult;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

router.get("/my", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    await ensureExamResultPublicSlugs(req);
    var pageLimit = helper.readPagination(req.query);
    var page = pageLimit.page;
    var limit = pageLimit.limit;
    var offset = (page - 1) * limit;
    var values: any[] = [req.currentUser.id];
    var idx = 2;
    var conditions: string[] = ["er.user_id = $1"];
    var whereClause;
    var countResult;
    var total;
    var result;
    var items;

    if (req.query.examId) {
      conditions.push("er.exam_id = $" + idx++);
      values.push(req.query.examId);
    }

    if (req.query.courseId) {
      conditions.push("e.course_id = $" + idx++);
      values.push(req.query.courseId);
    }

    whereClause = conditions.join(" AND ");

    countResult = await pool.query(
      `SELECT COUNT(*)
       FROM exam_results er
       LEFT JOIN exams e ON e.id = er.exam_id
       WHERE ${whereClause}`,
      values,
    );
    total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    result = await pool.query(
      `SELECT er.id, er.public_slug, er.exam_id, er.score,
              er.submitted_at, e.title AS exam_title
       FROM exam_results er
       LEFT JOIN exams e ON e.id = er.exam_id
       WHERE ${whereClause}
       ORDER BY er.submitted_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    items = result.rows.map(function (row) {
      return {
        id: row.id,
        publicSlug: row.public_slug,
        examId: row.exam_id,
        examTitle: row.exam_title,
        score: parseFloat(row.score),
        submittedAt: row.submitted_at,
      };
    });

    helper.sendSuccess(
      res,
      "My exam results fetched",
      items,
      helper.buildPaginationMeta(page, limit, total),
    );
  } catch (error) {
    console.error("list my exam results error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post("/", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    await ensureExamResultPublicSlugs(req);
    var body = req.body || {};
    var sessionResult;
    var session;
    var questionsResult;
    var answersByQuestionId: any = {};
    var i;
    var questionId;
    var correctCount = 0;
    var totalQuestions;
    var wrongCount;
    var score;
    var insertResult;
    var submittedAt = new Date();
    var durationSpentSeconds = 0;
    var sessionStartedAt;
    var sessionExpiresAt;
    var clientDurationSpentSeconds = Number(body.durationSpentSeconds);

    if (
      !body.examSessionId ||
      !body.examId ||
      !Array.isArray(body.answers) ||
      body.durationSpentSeconds === undefined
    ) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "examSessionId",
          message: "examSessionId, examId, answers and durationSpentSeconds are required",
        },
      ]);
      return;
    }

    sessionResult = await pool.query(
      `SELECT id, exam_id, user_id, started_at, expires_at, submitted_at
       FROM exam_sessions
       WHERE id = $1
       LIMIT 1`,
      [body.examSessionId],
    );

    if (sessionResult.rows.length === 0) {
      helper.sendError(res, 404, "Exam session not found");
      return;
    }

    session = sessionResult.rows[0];

    if (String(session.exam_id) !== String(body.examId)) {
      helper.sendError(res, 403, "Forbidden");
      return;
    }

    if (String(session.user_id) !== String(req.currentUser.id)) {
      helper.sendError(res, 403, "Forbidden");
      return;
    }

    if (session.submitted_at) {
      helper.sendError(res, 409, "Exam already submitted");
      return;
    }

    sessionStartedAt = new Date(session.started_at);
    sessionExpiresAt = new Date(session.expires_at);

    if (!Number.isNaN(sessionStartedAt.getTime())) {
      durationSpentSeconds = Math.max(
        0,
        Math.floor(
          (
            Math.min(submittedAt.getTime(), sessionExpiresAt.getTime()) -
            sessionStartedAt.getTime()
          ) / 1000,
        ),
      );
    } else if (
      Number.isFinite(clientDurationSpentSeconds) &&
      clientDurationSpentSeconds >= 0
    ) {
      durationSpentSeconds = Math.floor(clientDurationSpentSeconds);
    }

    questionsResult = await pool.query(
      `SELECT id, correct_answer
       FROM questions
       WHERE exam_id = $1
       ORDER BY order_index ASC, created_at ASC`,
      [body.examId],
    );

    for (i = 0; i < body.answers.length; i++) {
      if (body.answers[i] && body.answers[i].questionId !== undefined) {
        answersByQuestionId[String(body.answers[i].questionId)] =
          body.answers[i].selectedAnswer;
      }
    }

    for (i = 0; i < questionsResult.rows.length; i++) {
      questionId = String(questionsResult.rows[i].id);

      if (
        isSameAnswer(
          answersByQuestionId[questionId],
          questionsResult.rows[i].correct_answer,
        )
      ) {
        correctCount++;
      }
    }

    totalQuestions = questionsResult.rows.length;
    wrongCount = Math.max(totalQuestions - correctCount, 0);
    score = totalQuestions > 0
      ? Number(((correctCount / totalQuestions) * 100).toFixed(2))
      : 0;

    insertResult = await pool.query(
      `INSERT INTO exam_results (
        exam_session_id, exam_id, user_id, answers, score,
        correct_count, wrong_count, duration_spent_seconds, status,
        submitted_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'SUBMITTED', NOW(), NOW(), NOW())
      RETURNING id, public_slug, exam_id, user_id, score,
                correct_count, wrong_count, submitted_at`,
      [
        body.examSessionId,
        body.examId,
        req.currentUser.id,
        JSON.stringify(body.answers),
        score,
        correctCount,
        wrongCount,
        durationSpentSeconds,
      ],
    );

    await pool.query(
      `UPDATE exam_sessions
       SET submitted_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [body.examSessionId],
    );

    helper.sendCreated(res, "Exam submitted successfully", {
      id: insertResult.rows[0].id,
      publicSlug: insertResult.rows[0].public_slug,
      examId: insertResult.rows[0].exam_id,
      userId: insertResult.rows[0].user_id,
      score: parseFloat(insertResult.rows[0].score),
      correctCount: insertResult.rows[0].correct_count,
      wrongCount: insertResult.rows[0].wrong_count,
      submittedAt: insertResult.rows[0].submitted_at,
    });
  } catch (error) {
    console.error("submit exam error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id/review", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var examResult = await ensureExamResultReviewAccess(req, res, req.params.id);
    var fields: string[] = ["status = 'REVIEWED'", "reviewed_at = NOW()", "updated_at = NOW()"];
    var values: any[] = [];
    var idx = 1;
    var result;

    if (!examResult) {
      return;
    }

    if (body.feedback === undefined && body.manualScore === undefined) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "body",
          message: "feedback or manualScore is required",
        },
      ]);
      return;
    }

    if (body.feedback !== undefined) {
      fields.push("feedback = $" + idx++);
      values.push(body.feedback);
    }

    if (body.manualScore !== undefined) {
      fields.push("score = $" + idx++);
      values.push(body.manualScore);
    }

    values.push(examResult.id);

    result = await pool.query(
      `UPDATE exam_results
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING id, score, feedback, reviewed_at`,
      values,
    );

    helper.sendSuccess(res, "Exam result reviewed", {
      id: result.rows[0].id,
      score: parseFloat(result.rows[0].score),
      feedback: result.rows[0].feedback,
      reviewedAt: result.rows[0].reviewed_at,
    });
  } catch (error) {
    console.error("review exam result error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.get("/:id", checkLogin, async function (req, res, next) {
  try {
    var examResult = await ensureExamResultViewAccess(req, res, req.params.id);

    if (!examResult) {
      return;
    }

    helper.sendSuccess(res, "Exam result fetched", {
      id: examResult.id,
      publicSlug: examResult.public_slug,
      examId: examResult.exam_id,
      examTitle: examResult.exam_title,
      userId: examResult.user_id,
      score: parseFloat(examResult.score),
      correctCount: examResult.correct_count,
      wrongCount: examResult.wrong_count,
      durationSpentSeconds: examResult.duration_spent_seconds,
      feedback: examResult.feedback,
      reviewedAt: examResult.reviewed_at,
      submittedAt: examResult.submitted_at,
    });
  } catch (error) {
    console.error("get exam result error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
