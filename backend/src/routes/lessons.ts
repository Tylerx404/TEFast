var express = require("express");
var helper = require("../utils/helper");
var lessonsModule = require("../schemas/lessons");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var lessonContentTypes = lessonsModule.lessonContentTypes;
var checkLogin = authHandler.checkLogin;
var checkRole = authHandler.checkRole;

async function findLessonById(req, lessonId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    `SELECT l.*, c.teacher_id
     FROM lessons l
     LEFT JOIN courses c ON c.id = l.course_id
     WHERE l.id = $1
     LIMIT 1`,
    [lessonId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function canViewLesson(req, lesson) {
  var pool = req.app.locals.pg;
  var enrollmentResult;

  if (
    req.currentUser.role.name === "ADMIN" ||
    lesson.teacher_id === req.currentUser.id
  ) {
    return true;
  }

  enrollmentResult = await pool.query(
    `SELECT id
     FROM enrollments
     WHERE course_id = $1
       AND user_id = $2
       AND status IN ('ACTIVE', 'COMPLETED')
     LIMIT 1`,
    [lesson.course_id, req.currentUser.id],
  );

  return enrollmentResult.rows.length > 0;
}

async function ensureLessonOwnerOrAdmin(req, res, lessonId) {
  var lesson = await findLessonById(req, lessonId);

  if (!lesson) {
    helper.sendError(res, 404, "Lesson not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    lesson.teacher_id === req.currentUser.id
  ) {
    return lesson;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

router.get("/:id", checkLogin, async function (req, res, next) {
  try {
    var lesson = await findLessonById(req, req.params.id);

    if (!lesson) {
      helper.sendError(res, 404, "Lesson not found");
      return;
    }

    if (!(await canViewLesson(req, lesson))) {
      helper.sendError(res, 403, "Forbidden");
      return;
    }

    helper.sendSuccess(res, "Lesson fetched", {
      id: lesson.id,
      courseId: lesson.course_id,
      title: lesson.title,
      contentType: lesson.content_type,
      content: lesson.content,
      attachmentUrl: lesson.attachment_url,
      orderIndex: lesson.order_index,
      isPreview: lesson.is_preview,
    });
  } catch (error) {
    console.error("get lesson error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id/order", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var orderIndex = req.body && req.body.orderIndex;
    var lesson = await ensureLessonOwnerOrAdmin(req, res, req.params.id);
    var result;
    var row;

    if (!lesson) {
      return;
    }

    if (orderIndex === undefined) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "orderIndex",
          message: "Order index is required",
        },
      ]);
      return;
    }

    result = await pool.query(
      `UPDATE lessons
       SET order_index = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, order_index, updated_at`,
      [orderIndex, req.params.id],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Lesson not found");
      return;
    }

    row = result.rows[0];

    helper.sendSuccess(res, "Lesson order updated", {
      id: row.id,
      orderIndex: row.order_index,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("update lesson order error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var lesson = await ensureLessonOwnerOrAdmin(req, res, req.params.id);
    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;
    var result;
    var row;

    if (!lesson) {
      return;
    }

    if (body.contentType !== undefined && !lessonContentTypes.includes(body.contentType)) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "contentType",
          message: "Content type is invalid",
        },
      ]);
      return;
    }

    if (body.title !== undefined) {
      fields.push("title = $" + idx++);
      values.push(body.title);
    }

    if (body.contentType !== undefined) {
      fields.push("content_type = $" + idx++);
      values.push(body.contentType);
    }

    if (body.content !== undefined) {
      fields.push("content = $" + idx++);
      values.push(body.content);
    }

    if (body.attachmentUrl !== undefined) {
      fields.push("attachment_url = $" + idx++);
      values.push(body.attachmentUrl);
    }

    if (body.orderIndex !== undefined) {
      fields.push("order_index = $" + idx++);
      values.push(body.orderIndex);
    }

    if (body.isPreview !== undefined) {
      fields.push("is_preview = $" + idx++);
      values.push(body.isPreview === true);
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
      `UPDATE lessons SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Lesson not found");
      return;
    }

    row = result.rows[0];

    helper.sendSuccess(res, "Lesson updated", {
      id: row.id,
      title: row.title,
      isPreview: row.is_preview,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("update lesson error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.delete("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var lesson = await ensureLessonOwnerOrAdmin(req, res, req.params.id);
    var result;

    if (!lesson) {
      return;
    }

    result = await pool.query(
      "DELETE FROM lessons WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Lesson not found");
      return;
    }

    helper.sendSuccess(res, "Lesson deleted", {
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("delete lesson error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
