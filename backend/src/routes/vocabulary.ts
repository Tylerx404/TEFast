var express = require("express");
var helper = require("../utils/helper");
var vocabularyModule = require("../schemas/vocabulary");
var coursesModule = require("../schemas/courses");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var courseCategories = coursesModule.courseCategories;
var courseLevels = coursesModule.courseLevels;
var checkLogin = authHandler.checkLogin;
var checkRole = authHandler.checkRole;

async function findVocabularyById(req, vocabularyId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    `SELECT *
     FROM vocabulary
     WHERE id = $1
     LIMIT 1`,
    [vocabularyId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

function isVocabularyVisibleToUser(vocabulary, currentUser) {
  if (!vocabulary) {
    return false;
  }

  if (vocabulary.is_published) {
    return true;
  }

  if (!currentUser) {
    return false;
  }

  return (
    currentUser.role.name === "ADMIN" ||
    vocabulary.teacher_id === currentUser.id
  );
}

async function ensureVocabularyOwnerOrAdmin(req, res, vocabularyId) {
  var vocabulary = await findVocabularyById(req, vocabularyId);

  if (!vocabulary) {
    helper.sendError(res, 404, "Vocabulary item not found");
    return null;
  }

  if (
    req.currentUser.role.name === "ADMIN" ||
    vocabulary.teacher_id === req.currentUser.id
  ) {
    return vocabulary;
  }

  helper.sendError(res, 403, "Forbidden");
  return null;
}

router.get("/topics", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var values: any[] = [];
    var whereClause = "WHERE topic IS NOT NULL";
    var result;
    var items;

    if (req.query.category && courseCategories.includes(req.query.category)) {
      whereClause += " AND category = $1";
      values.push(req.query.category);
    }

    result = await pool.query(
      `SELECT topic, COUNT(*) AS total_words
       FROM vocabulary
       ${whereClause}
       GROUP BY topic
       ORDER BY topic ASC`,
      values,
    );

    items = result.rows.map(function (row) {
      return {
        topic: row.topic,
        totalWords: parseInt(row.total_words, 10),
      };
    });

    helper.sendSuccess(res, "Vocabulary topics fetched", items);
  } catch (error) {
    console.error("list vocabulary topics error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.get("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var currentUser = await authHandler.tryLoadCurrentUser(req);
    var pageLimit = helper.readPagination(req.query);
    var page = pageLimit.page;
    var limit = pageLimit.limit;
    var offset = (page - 1) * limit;
    var values: any[] = [];
    var idx = 1;
    var conditions: string[] = [];
    var whereClause;
    var countResult;
    var total;
    var result;
    var items;

    if (req.query.category && courseCategories.includes(req.query.category)) {
      conditions.push("category = $" + idx++);
      values.push(req.query.category);
    }

    if (req.query.topic) {
      conditions.push("topic = $" + idx++);
      values.push(req.query.topic);
    }

    if (req.query.level && courseLevels.includes(req.query.level)) {
      conditions.push("level = $" + idx++);
      values.push(req.query.level);
    }

    if (req.query.keyword) {
      conditions.push("(word ILIKE $" + idx + " OR meaning ILIKE $" + idx + ")");
      values.push("%" + req.query.keyword + "%");
      idx++;
    }

    if (req.query.teacherId) {
      conditions.push("teacher_id = $" + idx++);
      values.push(req.query.teacherId);
    }

    if (currentUser && currentUser.role.name === "ADMIN") {
    } else if (currentUser && currentUser.role.name === "TEACHER") {
      conditions.push("teacher_id = $" + idx++);
      values.push(currentUser.id);
    } else {
      conditions.push("is_published = TRUE");
    }

    whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    countResult = await pool.query(
      `SELECT COUNT(*) FROM vocabulary ${whereClause}`,
      values,
    );
    total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    result = await pool.query(
      `SELECT id, word, meaning, category, topic, level
       FROM vocabulary
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    items = result.rows.map(function (row) {
      return {
        id: row.id,
        word: row.word,
        meaning: row.meaning,
        category: row.category,
        topic: row.topic,
        level: row.level,
      };
    });

    helper.sendSuccess(
      res,
      "Vocabulary fetched",
      items,
      helper.buildPaginationMeta(page, limit, total),
    );
  } catch (error) {
    console.error("list vocabulary error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post("/", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var result;

    if (!body.word || !body.meaning || !body.category || !body.level) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "word",
          message: "word, meaning, category and level are required",
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

    if (!courseLevels.includes(body.level)) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "level",
          message: "Level must be BEGINNER, INTERMEDIATE or ADVANCED",
        },
      ]);
      return;
    }

    result = await pool.query(
      `INSERT INTO vocabulary (
        teacher_id, word, phonetic, meaning, example, category, topic,
        level, audio_url, image_url, is_published, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING id, word, category`,
      [
        req.currentUser.id,
        body.word,
        body.phonetic || null,
        body.meaning,
        body.example || null,
        body.category,
        body.topic || null,
        body.level,
        body.audioUrl || null,
        body.imageUrl || null,
        body.isPublished === true,
      ],
    );

    helper.sendCreated(res, "Vocabulary created", {
      id: result.rows[0].id,
      word: result.rows[0].word,
      category: result.rows[0].category,
    });
  } catch (error) {
    console.error("create vocabulary error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var currentUser = await authHandler.tryLoadCurrentUser(req);
    var vocabulary = await findVocabularyById(req, req.params.id);

    if (!vocabulary) {
      helper.sendError(res, 404, "Vocabulary item not found");
      return;
    }

    if (!isVocabularyVisibleToUser(vocabulary, currentUser)) {
      helper.sendError(res, 404, "Vocabulary item not found");
      return;
    }

    helper.sendSuccess(res, "Vocabulary item fetched", {
      id: vocabulary.id,
      word: vocabulary.word,
      phonetic: vocabulary.phonetic,
      meaning: vocabulary.meaning,
      example: vocabulary.example,
      category: vocabulary.category,
      topic: vocabulary.topic,
      level: vocabulary.level,
      audioUrl: vocabulary.audio_url,
      imageUrl: vocabulary.image_url,
    });
  } catch (error) {
    console.error("get vocabulary error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var vocabulary = await ensureVocabularyOwnerOrAdmin(req, res, req.params.id);
    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;
    var result;

    if (!vocabulary) {
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

    if (body.level !== undefined && !courseLevels.includes(body.level)) {
      helper.sendError(res, 422, "Validation failed", [
        {
          field: "level",
          message: "Level must be BEGINNER, INTERMEDIATE or ADVANCED",
        },
      ]);
      return;
    }

    if (body.word !== undefined) {
      fields.push("word = $" + idx++);
      values.push(body.word);
    }

    if (body.phonetic !== undefined) {
      fields.push("phonetic = $" + idx++);
      values.push(body.phonetic);
    }

    if (body.meaning !== undefined) {
      fields.push("meaning = $" + idx++);
      values.push(body.meaning);
    }

    if (body.example !== undefined) {
      fields.push("example = $" + idx++);
      values.push(body.example);
    }

    if (body.category !== undefined) {
      fields.push("category = $" + idx++);
      values.push(body.category);
    }

    if (body.topic !== undefined) {
      fields.push("topic = $" + idx++);
      values.push(body.topic);
    }

    if (body.level !== undefined) {
      fields.push("level = $" + idx++);
      values.push(body.level);
    }

    if (body.audioUrl !== undefined) {
      fields.push("audio_url = $" + idx++);
      values.push(body.audioUrl);
    }

    if (body.imageUrl !== undefined) {
      fields.push("image_url = $" + idx++);
      values.push(body.imageUrl);
    }

    if (body.isPublished !== undefined) {
      fields.push("is_published = $" + idx++);
      values.push(body.isPublished === true);
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
      `UPDATE vocabulary
       SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING id, level, updated_at`,
      values,
    );

    helper.sendSuccess(res, "Vocabulary updated", {
      id: result.rows[0].id,
      level: result.rows[0].level,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error("update vocabulary error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.delete("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var vocabulary = await ensureVocabularyOwnerOrAdmin(req, res, req.params.id);

    if (!vocabulary) {
      return;
    }

    await pool.query("DELETE FROM vocabulary WHERE id = $1", [req.params.id]);

    helper.sendSuccess(res, "Vocabulary deleted", {
      id: req.params.id,
    });
  } catch (error) {
    console.error("delete vocabulary error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
