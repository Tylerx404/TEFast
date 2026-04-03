var express = require("express");
var helper = require("../utils/helper");
var coursesModule = require("../schemas/courses");
var lessonsModule = require("../schemas/lessons");
var enrollmentsModule = require("../schemas/enrollments");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var courseCategories = coursesModule.courseCategories;
var courseLevels = coursesModule.courseLevels;
var lessonContentTypes = lessonsModule.lessonContentTypes;
var enrollmentStatuses = enrollmentsModule.enrollmentStatuses;
var checkLogin = authHandler.checkLogin;
var checkRole = authHandler.checkRole;

async function findCourseById(req, courseId) {
  var pool = req.app.locals.pg;
  var result = await pool.query(
    "SELECT id, teacher_id, is_published FROM courses WHERE id = $1 LIMIT 1",
    [courseId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

function isCourseVisibleToUser(course, currentUser) {
  if (!course) {
    return false;
  }

  if (course.is_published) {
    return true;
  }

  if (!currentUser) {
    return false;
  }

  return (
    currentUser.role.name === "ADMIN" ||
    course.teacher_id === currentUser.id
  );
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

async function buildCourseLessonAccess(req, courseId) {
  var pool = req.app.locals.pg;
  var course = await findCourseById(req, courseId);
  var currentUser;
  var enrollmentResult;

  if (!course) {
    return null;
  }

  currentUser = await authHandler.tryLoadCurrentUser(req);

  if (!isCourseVisibleToUser(course, currentUser)) {
    return null;
  }

  if (!currentUser) {
    return {
      course: course,
      canViewAll: false,
    };
  }

  if (
    currentUser.role.name === "ADMIN" ||
    course.teacher_id === currentUser.id
  ) {
    return {
      course: course,
      canViewAll: true,
    };
  }

  enrollmentResult = await pool.query(
    `SELECT id
     FROM enrollments
     WHERE course_id = $1
       AND user_id = $2
       AND status IN ('ACTIVE', 'COMPLETED')
     LIMIT 1`,
    [courseId, currentUser.id],
  );

  return {
    course: course,
    canViewAll: enrollmentResult.rows.length > 0,
  };
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
    var courses;

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
      values.push(req.query.isPublished === "true");
    }

    if (!currentUser || currentUser.role.name === "STUDENT") {
      conditions.push("c.is_published = TRUE");
    } else if (currentUser.role.name === "TEACHER") {
      conditions.push("(c.is_published = TRUE OR c.teacher_id = $" + idx++ + ")");
      values.push(currentUser.id);
    }

    whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    countResult = await pool.query(
      `SELECT COUNT(*) FROM courses c ${whereClause}`,
      values,
    );
    total = parseInt(countResult.rows[0].count, 10);

    values.push(limit, offset);
    result = await pool.query(
      `SELECT c.*, u.full_name AS teacher_name
       FROM courses c
       LEFT JOIN users u ON u.id = c.teacher_id
       ${whereClause}
       ORDER BY c.created_at DESC
       LIMIT $${idx++} OFFSET $${idx++}`,
      values,
    );

    courses = result.rows.map(function (row) {
      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        category: row.category,
        level: row.level,
        thumbnailUrl: row.thumbnail_url,
        teacher: {
          id: row.teacher_id,
          fullName: row.teacher_name,
        },
        isPublished: row.is_published,
      };
    });

    helper.sendSuccess(
      res,
      "Courses fetched",
      courses,
      helper.buildPaginationMeta(page, limit, total),
    );
  } catch (error) {
    console.error("list courses error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post("/", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var existSlug;
    var result;
    var row;

    if (
      !body.title ||
      !body.slug ||
      !body.description ||
      !body.category ||
      !body.level
    ) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "title",
          message: "title, slug, description, category and level are required",
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

    existSlug = await pool.query(
      "SELECT id FROM courses WHERE slug = $1 LIMIT 1",
      [body.slug],
    );

    if (existSlug.rows.length > 0) {
      helper.sendError(res, 409, "Slug already exists");
      return;
    }

    result = await pool.query(
      `INSERT INTO courses (
        teacher_id, title, slug, description, category, level, price,
        thumbnail_url, is_published, published_at, created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, CASE WHEN $9 = TRUE THEN NOW() ELSE NULL END, NOW(), NOW()
      )
      RETURNING *`,
      [
        req.currentUser.id,
        body.title,
        body.slug,
        body.description,
        body.category,
        body.level,
        body.price ?? 0,
        body.thumbnailUrl || null,
        body.isPublished === true,
      ],
    );

    row = result.rows[0];

    helper.sendCreated(res, "Course created", {
      id: row.id,
      title: row.title,
      slug: row.slug,
      category: row.category,
      teacherId: row.teacher_id,
      createdAt: row.created_at,
    });
  } catch (error) {
    console.error("create course error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.get("/:courseId/lessons", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var includePreviewOnly = req.query.includePreviewOnly === "true";
    var access = await buildCourseLessonAccess(req, req.params.courseId);
    var condition = "";
    var result;
    var lessons;

    if (!access) {
      helper.sendError(res, 404, "Course not found");
      return;
    }

    if (includePreviewOnly || !access.canViewAll) {
      condition = "AND is_preview = TRUE";
    }

    result = await pool.query(
      `SELECT id, course_id, title, content_type, order_index, is_preview
       FROM lessons
       WHERE course_id = $1 ${condition}
       ORDER BY order_index ASC, created_at ASC`,
      [req.params.courseId],
    );

    lessons = result.rows.map(function (row) {
      return {
        id: row.id,
        courseId: row.course_id,
        title: row.title,
        contentType: row.content_type,
        orderIndex: row.order_index,
        isPreview: row.is_preview,
      };
    });

    helper.sendSuccess(res, "Course lessons fetched", lessons);
  } catch (error) {
    console.error("list course lessons error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.post(
  "/:courseId/lessons",
  checkLogin,
  checkRole("TEACHER", "ADMIN"),
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var body = req.body || {};
      var course = await ensureCourseOwnerOrAdmin(req, res, req.params.courseId);
      var result;
      var row;

      if (!course) {
        return;
      }

      if (
        !body.title ||
        !body.contentType ||
        !body.content ||
        body.orderIndex === undefined
      ) {
        helper.sendError(res, 400, "Validation failed", [
          {
            field: "title",
            message: "title, contentType, content and orderIndex are required",
          },
        ]);
        return;
      }

      if (!lessonContentTypes.includes(body.contentType)) {
        helper.sendError(res, 422, "Validation failed", [
          {
            field: "contentType",
            message: "Content type is invalid",
          },
        ]);
        return;
      }

      result = await pool.query(
        `INSERT INTO lessons (
          course_id, title, content_type, content, attachment_url,
          order_index, is_preview, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *`,
        [
          req.params.courseId,
          body.title,
          body.contentType,
          body.content,
          body.attachmentUrl || null,
          body.orderIndex,
          body.isPreview === true,
        ],
      );

      row = result.rows[0];

      helper.sendCreated(res, "Lesson created", {
        id: row.id,
        courseId: row.course_id,
        title: row.title,
        orderIndex: row.order_index,
      });
    } catch (error) {
      console.error("create course lesson error:", error);
      helper.sendError(res, 500, "Internal server error");
    }
  },
);

router.get(
  "/:courseId/enrollments",
  checkLogin,
  checkRole("TEACHER", "ADMIN"),
  async function (req, res, next) {
    try {
      var pool = req.app.locals.pg;
      var pageLimit = helper.readPagination(req.query);
      var page = pageLimit.page;
      var limit = pageLimit.limit;
      var offset = (page - 1) * limit;
      var course = await ensureCourseOwnerOrAdmin(req, res, req.params.courseId);
      var values: any[] = [req.params.courseId];
      var idx = 2;
      var whereClause = "e.course_id = $1";
      var countResult;
      var total;
      var result;
      var enrollments;

      if (!course) {
        return;
      }

      if (
        req.query.status &&
        enrollmentStatuses.includes(String(req.query.status).toUpperCase())
      ) {
        whereClause += " AND e.status = $" + idx++;
        values.push(String(req.query.status).toUpperCase());
      }

      countResult = await pool.query(
        `SELECT COUNT(*) FROM enrollments e WHERE ${whereClause}`,
        values,
      );
      total = parseInt(countResult.rows[0].count, 10);

      values.push(limit, offset);
      result = await pool.query(
        `SELECT e.id, e.progress_percent, e.status, u.id AS user_id, u.full_name
         FROM enrollments e
         LEFT JOIN users u ON u.id = e.user_id
         WHERE ${whereClause}
         ORDER BY e.enrolled_at DESC
         LIMIT $${idx++} OFFSET $${idx++}`,
        values,
      );

      enrollments = result.rows.map(function (row) {
        return {
          id: row.id,
          user: {
            id: row.user_id,
            fullName: row.full_name,
          },
          progressPercent: parseFloat(row.progress_percent),
          status: row.status,
        };
      });

      helper.sendSuccess(
        res,
        "Course enrollments fetched",
        enrollments,
        helper.buildPaginationMeta(page, limit, total),
      );
    } catch (error) {
      console.error("list course enrollments error:", error);
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
      helper.sendError(res, 404, "Course not found");
      return;
    }

    row = result.rows[0];

    if (!isCourseVisibleToUser(row, currentUser)) {
      helper.sendError(res, 404, "Course not found");
      return;
    }

    helper.sendSuccess(res, "Course fetched", {
      id: row.id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      category: row.category,
      level: row.level,
      price: parseFloat(row.price),
      thumbnailUrl: row.thumbnail_url,
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
    });
  } catch (error) {
    console.error("get course error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.patch("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};
    var course = await ensureCourseOwnerOrAdmin(req, res, req.params.id);
    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;
    var existSlug;
    var result;
    var row;

    if (!course) {
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

    if (body.slug !== undefined) {
      existSlug = await pool.query(
        "SELECT id FROM courses WHERE slug = $1 AND id <> $2 LIMIT 1",
        [body.slug, req.params.id],
      );

      if (existSlug.rows.length > 0) {
        helper.sendError(res, 409, "Slug already exists");
        return;
      }
    }

    if (body.title !== undefined) {
      fields.push("title = $" + idx++);
      values.push(body.title);
    }

    if (body.slug !== undefined) {
      fields.push("slug = $" + idx++);
      values.push(body.slug);
    }

    if (body.description !== undefined) {
      fields.push("description = $" + idx++);
      values.push(body.description);
    }

    if (body.category !== undefined) {
      fields.push("category = $" + idx++);
      values.push(body.category);
    }

    if (body.level !== undefined) {
      fields.push("level = $" + idx++);
      values.push(body.level);
    }

    if (body.price !== undefined) {
      fields.push("price = $" + idx++);
      values.push(body.price);
    }

    if (body.thumbnailUrl !== undefined) {
      fields.push("thumbnail_url = $" + idx++);
      values.push(body.thumbnailUrl);
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
      `UPDATE courses SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Course not found");
      return;
    }

    row = result.rows[0];

    helper.sendSuccess(res, "Course updated", {
      id: row.id,
      title: row.title,
      price: parseFloat(row.price),
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error("update course error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

router.delete("/:id", checkLogin, checkRole("TEACHER", "ADMIN"), async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var course = await ensureCourseOwnerOrAdmin(req, res, req.params.id);
    var result;

    if (!course) {
      return;
    }

    result = await pool.query(
      "DELETE FROM courses WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      helper.sendError(res, 404, "Course not found");
      return;
    }

    helper.sendSuccess(res, "Course deleted", {
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("delete course error:", error);
    helper.sendError(res, 500, "Internal server error");
  }
});

module.exports = router;
