var express = require("express");
var helper = require("../utils/helper");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var checkLogin = authHandler.checkLogin;

async function findCommentById(req, commentId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    `SELECT c.*, u.full_name,
            COALESCE(course_direct.title, course_from_lesson.title) AS course_title
     FROM comments c
     LEFT JOIN users u ON u.id = c.user_id
     LEFT JOIN courses course_direct ON course_direct.id = c.course_id
     LEFT JOIN lessons l ON l.id = c.lesson_id
     LEFT JOIN courses course_from_lesson ON course_from_lesson.id = l.course_id
     WHERE c.id = $1
     LIMIT 1`,
    [commentId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

function serializeComment(comment, options) {
  var settings = options || {};
  var payload: any = {
    content: comment.content,
    courseTitle: comment.course_title || null,
    createdAt: comment.created_at,
    user: {
      fullName: comment.full_name || "Hoc vien",
    },
  };

  if (settings.includeId) {
    payload.id = comment.id;
  }

  if (settings.includeParentCommentId) {
    payload.parentCommentId = comment.parent_comment_id || null;
  }

  if (settings.includeUpdatedAt && comment.updated_at) {
    payload.updatedAt = comment.updated_at;
  }

  return payload;
}

async function ensureCommentOwnerOrAdmin(req, res, commentId) {
  var comment = await findCommentById(req, commentId);

  if (!comment) {
    helper.sendError(res, 404, "Comment not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    comment.user_id === req.currentUser.id
  ) {
    return comment;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

router.get("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var pageLimit = helper.readPagination(req.query);
    var page = pageLimit.page;
    var limit = pageLimit.limit;
    var offset = (page - 1) * limit;
    var values: any[] = [];
    var idx = 1;
    var conditions: string[] = ["c.status <> 'DELETED'"];
    var whereClause;
    var countResult;
    var total;
    var result;
    var comments;

    if (req.query.courseId) {
      conditions.push("c.course_id = $" + idx++);
      values.push(req.query.courseId);
    }

    if (req.query.lessonId) {
      conditions.push("c.lesson_id = $" + idx++);
      values.push(req.query.lessonId);
    }

    if (req.query.parentCommentId !== undefined) {
      if (req.query.parentCommentId === "") {
        conditions.push("c.parent_comment_id IS NULL");
      } else {
        conditions.push("c.parent_comment_id = $" + idx++);
        values.push(req.query.parentCommentId);
      }
    }

    whereClause = conditions.join(" AND ");

    countResult = await pool.query(
      `SELECT COUNT(*)
       FROM comments c
       WHERE ${whereClause}`,
      values,
    );
    total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    result = await pool.query(
      `SELECT c.id, c.parent_comment_id, c.content, c.created_at, c.updated_at,
              u.full_name,
              COALESCE(course_direct.title, course_from_lesson.title) AS course_title
       FROM comments c
       LEFT JOIN users u ON u.id = c.user_id
       LEFT JOIN courses course_direct ON course_direct.id = c.course_id
       LEFT JOIN lessons l ON l.id = c.lesson_id
       LEFT JOIN courses course_from_lesson ON course_from_lesson.id = l.course_id
       WHERE ${whereClause}
       ORDER BY c.created_at ASC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    comments = result.rows.map(function (row) {
      return serializeComment(row, {
        includeId: true,
        includeParentCommentId: true,
        includeUpdatedAt: true,
      });
    });

    helper.sendSuccess(
      res,
      "Comments fetched",
      comments,
      helper.buildPaginationMeta(page, limit, total),
    );
  } catch (error) {
    console.error("list comments error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post("/", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var result;
    var createdComment;

    if (!body.content || (!body.courseId && !body.lessonId)) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "content",
          message: "content and one of courseId or lessonId are required",
        },
      ]);
      return;
    }

    result = await pool.query(
      `INSERT INTO comments (
        user_id, course_id, lesson_id, parent_comment_id, content,
        status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, 'ACTIVE', NOW(), NOW())
      RETURNING id, content, parent_comment_id, created_at`,
      [
        req.currentUser.id,
        body.courseId || null,
        body.lessonId || null,
        body.parentCommentId || null,
        body.content,
      ],
    );

    createdComment = await findCommentById(req, result.rows[0].id);

    helper.sendCreated(res, "Comment created", {
      content: createdComment ? createdComment.content : result.rows[0].content,
      courseTitle: createdComment ? createdComment.course_title || null : null,
      createdAt: createdComment ? createdComment.created_at : result.rows[0].created_at,
      user: {
        fullName: req.currentUser.fullName || "Hoc vien",
      },
    });
  } catch (error) {
    console.error("create comment error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var comment = await findCommentById(req, req.params.id);

    if (!comment || comment.status === "DELETED") {
      helper.sendError(res, 404, "Comment not found");
      return;
    }

    helper.sendSuccess(
      res,
      "Comment fetched",
      serializeComment(comment, {
        includeParentCommentId: true,
        includeUpdatedAt: true,
      }),
    );
  } catch (error) {
    console.error("get comment error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var comment = await ensureCommentOwnerOrAdmin(req, res, req.params.id);
    var result;
    var updatedComment;

    if (!comment) {
      return;
    }

    if (!body.content) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "content",
          message: "Content is required",
        },
      ]);
      return;
    }

    result = await pool.query(
      `UPDATE comments
       SET content = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, content, updated_at`,
      [body.content, req.params.id],
    );

    updatedComment = await findCommentById(req, req.params.id);

    helper.sendSuccess(
      res,
      "Comment updated",
      updatedComment
        ? serializeComment(updatedComment, {
            includeParentCommentId: true,
            includeUpdatedAt: true,
          })
        : {
            content: result.rows[0].content,
            courseTitle: null,
            createdAt: comment.created_at,
            updatedAt: result.rows[0].updated_at,
            user: {
              fullName: comment.full_name || "Hoc vien",
            },
          },
    );
  } catch (error) {
    console.error("update comment error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.delete("/:id", checkLogin, async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var comment = await ensureCommentOwnerOrAdmin(req, res, req.params.id);

    if (!comment) {
      return;
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [req.params.id]);

    helper.sendSuccess(res, "Comment deleted", null);
  } catch (error) {
    console.error("delete comment error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
