var express = require("express");
var crypto = require("crypto");
var helper = require("../utils/helper");
var examsModule = require("../schemas/exams");
var coursesModule = require("../schemas/courses");
var questionsModule = require("../schemas/questions");

var router = express.Router();
var examTypes = examsModule.examTypes;
var courseCategories = coursesModule.courseCategories;
var questionSections = questionsModule.questionSections;

router.get("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var { page, limit } = helper.readPagination(req.query);
    var offset = (page - 1) * limit;

    var conditions: string[] = [];
    var values: any[] = [];
    var idx = 1;

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

    var whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    var countResult = await pool.query(
      `SELECT COUNT(*) FROM exams e ${whereClause}`,
      values,
    );
    var total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    var result = await pool.query(
      `SELECT e.*, u.full_name AS teacher_name
       FROM exams e
       LEFT JOIN users u ON u.id = e.teacher_id
       ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    var exams = result.rows.map(function (row) {
      return {
        id: row.id,
        courseId: row.course_id,
        teacherId: row.teacher_id,
        teacherName: row.teacher_name,
        title: row.title,
        category: row.category,
        examType: row.exam_type,
        durationMinutes: row.duration_minutes,
        instructions: row.instructions,
        isPublished: row.is_published,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.send({
      message: "lay danh sach de thi thanh cong",
      exams: exams,
      pagination: helper.buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error("list exams error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.post("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

    if (!body.title || !body.category || !body.examType || !body.durationMinutes) {
      return res.status(400).send({
        message: "title, category, examType va durationMinutes la bat buoc",
      });
    }

    if (!courseCategories.includes(body.category) || !examTypes.includes(body.examType)) {
      return res.status(422).send({
        message: "category hoac examType khong hop le",
      });
    }

    var examId = crypto.randomUUID();

    var result = await pool.query(
      `INSERT INTO exams (id, course_id, teacher_id, title, category, exam_type, duration_minutes, instructions, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        examId,
        body.courseId || null,
        body.teacherId || req.userId || null,
        body.title,
        body.category,
        body.examType,
        body.durationMinutes,
        body.instructions || null,
        body.isPublished ?? false,
      ],
    );

    var row = result.rows[0];

    res.status(201).send({
      message: "them de thi thanh cong",
      exam: {
        id: row.id,
        courseId: row.course_id,
        teacherId: row.teacher_id,
        title: row.title,
        category: row.category,
        examType: row.exam_type,
        durationMinutes: row.duration_minutes,
        instructions: row.instructions,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("create exam error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.post("/:id/start", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var examResult = await pool.query(
      "SELECT id, duration_minutes FROM exams WHERE id = $1 LIMIT 1",
      [req.params.id],
    );

    if (examResult.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay de thi" });
    }

    res.send({
      message: "bat dau bai thi thanh cong",
      examSessionId: crypto.randomUUID(),
      examId: req.params.id,
      startedAt: helper.nowIso(),
      durationMinutes: examResult.rows[0].duration_minutes,
    });
  } catch (error) {
    console.error("start exam error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/:examId/questions", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT * FROM questions
       WHERE exam_id = $1
       ORDER BY order_index ASC`,
      [req.params.examId],
    );

    var questions = result.rows.map(function (row) {
      return {
        id: row.id,
        examId: row.exam_id,
        section: row.section,
        content: row.content,
        options: row.options,
        correctAnswer: row.correct_answer,
        explanation: row.explanation,
        orderIndex: row.order_index,
        audioUrl: row.audio_url,
        imageUrl: row.image_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.send({
      message: "lay cau hoi thanh cong",
      questions: questions,
    });
  } catch (error) {
    console.error("list exam questions error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.post("/:examId/questions", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

    if (!body.section || !body.content || body.correctAnswer === undefined) {
      return res.status(400).send({
        message: "section, content va correctAnswer la bat buoc",
      });
    }

    if (!questionSections.includes(body.section)) {
      return res.status(422).send({
        message: "section khong hop le",
      });
    }

    var questionId = crypto.randomUUID();

    var result = await pool.query(
      `INSERT INTO questions (id, exam_id, section, content, options, correct_answer, explanation, order_index, audio_url, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        questionId,
        req.params.examId,
        body.section,
        body.content,
        JSON.stringify(body.options || []),
        JSON.stringify(body.correctAnswer),
        body.explanation || null,
        body.orderIndex ?? 1,
        body.audioUrl || null,
        body.imageUrl || null,
      ],
    );

    var row = result.rows[0];

    res.status(201).send({
      message: "them cau hoi thanh cong",
      question: {
        id: row.id,
        examId: row.exam_id,
        section: row.section,
        content: row.content,
        options: row.options,
        correctAnswer: row.correct_answer,
        explanation: row.explanation,
        orderIndex: row.order_index,
        audioUrl: row.audio_url,
        imageUrl: row.image_url,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("create exam question error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/:examId/results", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var { page, limit } = helper.readPagination(req.query);
    var offset = (page - 1) * limit;

    var countResult = await pool.query(
      "SELECT COUNT(*) FROM exam_results WHERE exam_id = $1",
      [req.params.examId],
    );
    var total = parseInt(countResult.rows[0].count, 10);

    var result = await pool.query(
      `SELECT er.id, er.exam_id, er.score, er.submitted_at,
              u.id AS user_id, u.full_name
       FROM exam_results er
       LEFT JOIN users u ON u.id = er.user_id
       WHERE er.exam_id = $1
       ORDER BY er.submitted_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.examId, limit, offset],
    );

    var results = result.rows.map(function (row) {
      return {
        id: row.id,
        user: {
          id: row.user_id,
          fullName: row.full_name,
        },
        examId: row.exam_id,
        score: parseFloat(row.score),
        submittedAt: row.submitted_at,
      };
    });

    res.send({
      message: "lay ket qua thi thanh cong",
      results: results,
      pagination: helper.buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error("list exam results error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT e.*, u.full_name AS teacher_name
       FROM exams e
       LEFT JOIN users u ON u.id = e.teacher_id
       WHERE e.id = $1
       LIMIT 1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay de thi" });
    }

    var row = result.rows[0];

    res.send({
      id: row.id,
      courseId: row.course_id,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      title: row.title,
      category: row.category,
      examType: row.exam_type,
      durationMinutes: row.duration_minutes,
      instructions: row.instructions,
      isPublished: row.is_published,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("get exam error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;

    if (body.title !== undefined) { fields.push("title = $" + idx++); values.push(body.title); }
    if (body.category !== undefined) { fields.push("category = $" + idx++); values.push(body.category); }
    if (body.examType !== undefined) { fields.push("exam_type = $" + idx++); values.push(body.examType); }
    if (body.durationMinutes !== undefined) { fields.push("duration_minutes = $" + idx++); values.push(body.durationMinutes); }
    if (body.instructions !== undefined) { fields.push("instructions = $" + idx++); values.push(body.instructions); }
    if (body.isPublished !== undefined) {
      fields.push("is_published = $" + idx++);
      values.push(body.isPublished);
      if (body.isPublished) {
        fields.push("published_at = NOW()");
      }
    }

    if (fields.length === 0) {
      return res.status(400).send({ message: "khong co du lieu de cap nhat" });
    }

    fields.push("updated_at = NOW()");
    values.push(req.params.id);

    var result = await pool.query(
      `UPDATE exams SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay de thi" });
    }

    var row = result.rows[0];

    res.send({
      message: "cap nhat de thi thanh cong",
      exam: {
        id: row.id,
        courseId: row.course_id,
        teacherId: row.teacher_id,
        title: row.title,
        category: row.category,
        examType: row.exam_type,
        durationMinutes: row.duration_minutes,
        instructions: row.instructions,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("update exam error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      "DELETE FROM exams WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay de thi" });
    }

    res.send({
      message: "xoa de thi thanh cong",
      id: req.params.id,
    });
  } catch (error) {
    console.error("delete exam error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

module.exports = router;
