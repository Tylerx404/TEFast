var express = require("express");
var helper = require("../utils/helper");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var checkLogin = authHandler.checkLogin;

async function findCommentById(req, commentId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    `SELECT c.*, u.full_name
     FROM comments c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.id = $1
     LIMIT 1`,
    [commentId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
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
      `SELECT c.id, c.course_id, c.lesson_id, c.parent_comment_id, c.content,
              c.created_at, u.id AS user_id, u.full_name
       FROM comments c
       LEFT JOIN users u ON u.id = c.user_id
       WHERE ${whereClause}
       ORDER BY c.created_at ASC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    comments = result.rows.map(function (row) {
      return {
        id: row.id,
        courseId: row.course_id,
        lessonId: row.lesson_id,
        parentCommentId: row.parent_comment_id,
        content: row.content,
        user: {
          id: row.user_id,
          fullName: row.full_name,
        },
        createdAt: row.created_at,
      };
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

    helper.sendCreated(res, "Comment created", {
      id: result.rows[0].id,
      content: result.rows[0].content,
      parentCommentId: result.rows[0].parent_comment_id,
      createdAt: result.rows[0].created_at,
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

    helper.sendSuccess(res, "Comment fetched", {
      id: comment.id,
      courseId: comment.course_id,
      lessonId: comment.lesson_id,
      parentCommentId: comment.parent_comment_id,
      content: comment.content,
      createdAt: comment.created_at,
    });
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

    helper.sendSuccess(res, "Comment updated", {
      id: result.rows[0].id,
      content: result.rows[0].content,
      updatedAt: result.rows[0].updated_at,
    });
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

    helper.sendSuccess(res, "Comment deleted", {
      id: req.params.id,
    });
  } catch (error) {
    console.error("delete comment error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
