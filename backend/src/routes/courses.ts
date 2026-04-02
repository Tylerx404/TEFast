var express = require("express");
var crypto = require("crypto");
var helper = require("../utils/helper");
var coursesModule = require("../schemas/courses");

var router = express.Router();
var courseCategories = coursesModule.courseCategories;
var courseLevels = coursesModule.courseLevels;

router.get("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var { page, limit } = helper.readPagination(req.query);
    var offset = (page - 1) * limit;

    var conditions: string[] = [];
    var values: any[] = [];
    var idx = 1;

    if (req.query.category && courseCategories.includes(req.query.category)) {
      conditions.push("c.category = $" + idx++);
      values.push(req.query.category);
    }
    if (req.query.teacherId) {
      conditions.push("c.teacher_id = $" + idx++);
      values.push(req.query.teacherId);
    }
    if (req.query.keyword) {
      conditions.push("c.title ILIKE $" + idx++);
      values.push("%" + req.query.keyword + "%");
    }
    if (req.query.isPublished !== undefined) {
      conditions.push("c.is_published = $" + idx++);
      values.push(req.query.isPublished !== "false");
    }

    var whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    var countResult = await pool.query(
      `SELECT COUNT(*) FROM courses c ${whereClause}`,
      values,
    );
    var total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    var result = await pool.query(
      `SELECT c.*, u.full_name AS teacher_name,
              (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count,
              (SELECT COUNT(*) FROM exams e WHERE e.course_id = c.id) AS exam_count,
              (SELECT COUNT(*) FROM enrollments en WHERE en.course_id = c.id) AS enrollment_count
       FROM courses c
       LEFT JOIN users u ON u.id = c.teacher_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    var courses = result.rows.map(function (row) {
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        category: row.category,
        level: row.level,
        price: parseFloat(row.price),
        thumbnailUrl: row.thumbnail_url,
        teacherId: row.teacher_id,
        teacher: {
          id: row.teacher_id,
          fullName: row.teacher_name,
        },
        stats: {
          lessonCount: parseInt(row.lesson_count, 10),
          examCount: parseInt(row.exam_count, 10),
          enrollmentCount: parseInt(row.enrollment_count, 10),
        },
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.send({
      message: "lay danh sach khoa hoc thanh cong",
      courses: courses,
      pagination: helper.buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error("list courses error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.post("/", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

    if (!body.title || !body.slug || !body.category || !body.level) {
      return res.status(400).send({
        message: "title, slug, category va level la bat buoc",
      });
    }

    if (!courseCategories.includes(body.category) || !courseLevels.includes(body.level)) {
      return res.status(422).send({
        message: "category hoac level khong hop le",
      });
    }

    // Check slug unique
    var existSlug = await pool.query(
      "SELECT id FROM courses WHERE slug = $1",
      [body.slug],
    );
    if (existSlug.rows.length > 0) {
      return res.status(409).send({
        message: "slug da ton tai",
      });
    }

    var courseId = crypto.randomUUID();

    var result = await pool.query(
      `INSERT INTO courses (id, teacher_id, title, slug, description, category, level, price, thumbnail_url, is_published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        courseId,
        body.teacherId || req.userId,
        body.title,
        body.slug,
        body.description || "",
        body.category,
        body.level,
        body.price ?? 0,
        body.thumbnailUrl || null,
        body.isPublished ?? false,
      ],
    );

    var row = result.rows[0];

    res.status(201).send({
      message: "them khoa hoc thanh cong",
      course: {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        category: row.category,
        level: row.level,
        price: parseFloat(row.price),
        thumbnailUrl: row.thumbnail_url,
        teacherId: row.teacher_id,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("create course error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/:courseId/lessons", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT * FROM lessons
       WHERE course_id = $1
       ORDER BY order_index ASC`,
      [req.params.courseId],
    );

    var lessons = result.rows.map(function (row) {
      return {
        id: row.id,
        courseId: row.course_id,
        title: row.title,
        contentType: row.content_type,
        content: row.content,
        attachmentUrl: row.attachment_url,
        orderIndex: row.order_index,
        isPreview: row.is_preview,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });

    res.send({
      message: "lay lesson thanh cong",
      lessons: lessons,
    });
  } catch (error) {
    console.error("list course lessons error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.post("/:courseId/lessons", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

    if (!body.title || !body.contentType || !body.content || body.orderIndex === undefined) {
      return res.status(400).send({
        message: "title, contentType, content va orderIndex la bat buoc",
      });
    }

    var lessonId = crypto.randomUUID();

    var result = await pool.query(
      `INSERT INTO lessons (id, course_id, title, content_type, content, attachment_url, order_index, is_preview)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        lessonId,
        req.params.courseId,
        body.title,
        body.contentType,
        body.content,
        body.attachmentUrl || null,
        body.orderIndex,
        body.isPreview ?? false,
      ],
    );

    var row = result.rows[0];

    res.status(201).send({
      message: "them lesson thanh cong",
      lesson: {
        id: row.id,
        courseId: row.course_id,
        title: row.title,
        contentType: row.content_type,
        content: row.content,
        attachmentUrl: row.attachment_url,
        orderIndex: row.order_index,
        isPreview: row.is_preview,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("create course lesson error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/:courseId/enrollments", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var { page, limit } = helper.readPagination(req.query);
    var offset = (page - 1) * limit;

    var countResult = await pool.query(
      "SELECT COUNT(*) FROM enrollments WHERE course_id = $1",
      [req.params.courseId],
    );
    var total = parseInt(countResult.rows[0].count, 10);

    var result = await pool.query(
      `SELECT e.id, e.course_id, e.progress_percent, e.status,
              u.id AS user_id, u.full_name
       FROM enrollments e
       LEFT JOIN users u ON u.id = e.user_id
       WHERE e.course_id = $1
       ORDER BY e.enrolled_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.courseId, limit, offset],
    );

    var enrollments = result.rows.map(function (row) {
      return {
        id: row.id,
        user: {
          id: row.user_id,
          fullName: row.full_name,
        },
        courseId: row.course_id,
        progressPercent: parseFloat(row.progress_percent),
        status: row.status,
      };
    });

    res.send({
      message: "lay danh sach dang ky thanh cong",
      enrollments: enrollments,
      pagination: helper.buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error("list course enrollments error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      `SELECT c.*, u.full_name AS teacher_name,
              (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count,
              (SELECT COUNT(*) FROM exams e WHERE e.course_id = c.id) AS exam_count,
              (SELECT COUNT(*) FROM enrollments en WHERE en.course_id = c.id) AS enrollment_count
       FROM courses c
       LEFT JOIN users u ON u.id = c.teacher_id
       WHERE c.id = $1
       LIMIT 1`,
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({
        message: "khong tim thay khoa hoc",
      });
    }

    var row = result.rows[0];

    res.send({
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      category: row.category,
      level: row.level,
      price: parseFloat(row.price),
      thumbnailUrl: row.thumbnail_url,
      teacherId: row.teacher_id,
      teacher: {
        id: row.teacher_id,
        fullName: row.teacher_name,
      },
      stats: {
        lessonCount: parseInt(row.lesson_count, 10),
        examCount: parseInt(row.exam_count, 10),
        enrollmentCount: parseInt(row.enrollment_count, 10),
      },
      isPublished: row.is_published,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("get course error:", error);
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
    if (body.slug !== undefined) { fields.push("slug = $" + idx++); values.push(body.slug); }
    if (body.description !== undefined) { fields.push("description = $" + idx++); values.push(body.description); }
    if (body.category !== undefined) { fields.push("category = $" + idx++); values.push(body.category); }
    if (body.level !== undefined) { fields.push("level = $" + idx++); values.push(body.level); }
    if (body.price !== undefined) { fields.push("price = $" + idx++); values.push(body.price); }
    if (body.thumbnailUrl !== undefined) { fields.push("thumbnail_url = $" + idx++); values.push(body.thumbnailUrl); }
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
      `UPDATE courses SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay khoa hoc" });
    }

    var row = result.rows[0];

    res.send({
      message: "cap nhat khoa hoc thanh cong",
      course: {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        category: row.category,
        level: row.level,
        price: parseFloat(row.price),
        thumbnailUrl: row.thumbnail_url,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("update course error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      "DELETE FROM courses WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay khoa hoc" });
    }

    res.send({
      message: "xoa khoa hoc thanh cong",
      id: req.params.id,
    });
  } catch (error) {
    console.error("delete course error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

module.exports = router;
