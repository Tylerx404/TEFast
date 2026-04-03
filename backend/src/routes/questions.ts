var express = require("express");
var helper = require("../utils/helper");
var questionsModule = require("../schemas/questions");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var questionSections = questionsModule.questionSections;
var checkLogin = authHandler.checkLogin;
var checkRole = authHandler.checkRole;

async function findQuestionById(req, questionId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    `SELECT q.*, e.teacher_id
     FROM questions q
     LEFT JOIN exams e ON e.id = q.exam_id
     WHERE q.id = $1
     LIMIT 1`,
    [questionId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function findQuestionSession(req, question) {
  var pool = req.app.locals.pg;
  var sessionResult;

  if (
    req.currentUser.role.name === "ADMIN" ||
    question.teacher_id === req.currentUser.id
  ) {
    return {
      canAccess: true,
      canViewExplanation: true,
    };
  }

  sessionResult = await pool.query(
    `SELECT
        COUNT(*) AS total_sessions,
        COUNT(*) FILTER (WHERE submitted_at IS NOT NULL) AS submitted_sessions
     FROM exam_sessions
     WHERE exam_id = $1
       AND user_id = $2`,
    [question.exam_id, req.currentUser.id],
  );

  return {
    canAccess: Number(sessionResult.rows[0].total_sessions || 0) > 0,
    canViewExplanation: Number(sessionResult.rows[0].submitted_sessions || 0) > 0,
  };
}

async function ensureQuestionOwnerOrAdmin(req, res, questionId) {
  var question = await findQuestionById(req, questionId);

  if (!question) {
    helper.sendError(res, 404, "Question not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    question.teacher_id === req.currentUser.id
  ) {
    return question;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

router.get("/:id", checkLogin, async function (req, res, next) {
  try {
    var question = await findQuestionById(req, req.params.id);
    var access;
    var explanation = null;

    if (!question) {
      helper.sendError(res, 404, "Question not found");
      return;
    }

    access = await findQuestionSession(req, question);

    if (!access.canAccess) {
      helper.sendError(res, 403, "Forbidden");
      return;
    }

    if (access.canViewExplanation) {
      explanation = question.explanation;
    }

    helper.sendSuccess(res, "Question fetched", {
      id: question.id,
      examId: question.exam_id,
      section: question.section,
      content: question.content,
      options: question.options,
      orderIndex: question.order_index,
      explanation: explanation,
      audioUrl: question.audio_url,
      imageUrl: question.image_url,
    });
  } catch (error) {
    console.error("get question error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var question = await ensureQuestionOwnerOrAdmin(req, res, req.params.id);
    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;
    var result;
    var row;

    if (!question) {
      return;
    }

    if (body.section !== undefined && !questionSections.includes(body.section)) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "section",
          message: "Question section is invalid",
        },
      ]);
      return;
    }

    if (body.section !== undefined) {
      fields.push("section = $" + idx++);
      values.push(body.section);
    }

    if (body.content !== undefined) {
      fields.push("content = $" + idx++);
      values.push(body.content);
    }

    if (body.options !== undefined) {
      fields.push("options = $" + idx++);
      values.push(JSON.stringify(body.options));
    }

    if (body.correctAnswer !== undefined) {
      fields.push("correct_answer = $" + idx++);
      values.push(JSON.stringify(body.correctAnswer));
    }

    if (body.explanation !== undefined) {
      fields.push("explanation = $" + idx++);
      values.push(body.explanation);
    }

    if (body.orderIndex !== undefined) {
      fields.push("order_index = $" + idx++);
      values.push(body.orderIndex);
    }

    if (body.audioUrl !== undefined) {
      fields.push("audio_url = $" + idx++);
      values.push(body.audioUrl);
    }

    if (body.imageUrl !== undefined) {
      fields.push("image_url = $" + idx++);
      values.push(body.imageUrl);
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
      `UPDATE questions SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Question not found");
      return;
    }

    row = result.rows[0];

    helper.sendSuccess(res, "Question updated", {
      id: row.id,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("update question error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.delete("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var question = await ensureQuestionOwnerOrAdmin(req, res, req.params.id);
    var result;

    if (!question) {
      return;
    }

    result = await pool.query(
      "DELETE FROM questions WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Question not found");
      return;
    }

    helper.sendSuccess(res, "Question deleted", {
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("delete question error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
