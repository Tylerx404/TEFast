var express = require("express");
var helper = require("../utils/helper");
var lessonsModule = require("../schemas/lessons");

var router = express.Router();
var lessonContentTypes = lessonsModule.lessonContentTypes;

router.get("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      "SELECT * FROM lessons WHERE id = $1 LIMIT 1",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay lesson" });
    }

    var row = result.rows[0];

    res.send({
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
    });
  } catch (error) {
    console.error("get lesson error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.patch("/:id/order", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var orderIndex = req.body && req.body.orderIndex;

    if (orderIndex === undefined) {
      return res.status(400).send({ message: "orderIndex la bat buoc" });
    }

    var result = await pool.query(
      `UPDATE lessons SET order_index = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, order_index, updated_at`,
      [orderIndex, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay lesson" });
    }

    var row = result.rows[0];

    res.send({
      message: "cap nhat thu tu lesson thanh cong",
      lesson: {
        id: row.id,
        orderIndex: row.order_index,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("update lesson order error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

    if (body.contentType && !lessonContentTypes.includes(body.contentType)) {
      return res.status(422).send({ message: "contentType khong hop le" });
    }

    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;

    if (body.title !== undefined) { fields.push("title = $" + idx++); values.push(body.title); }
    if (body.contentType !== undefined) { fields.push("content_type = $" + idx++); values.push(body.contentType); }
    if (body.content !== undefined) { fields.push("content = $" + idx++); values.push(body.content); }
    if (body.attachmentUrl !== undefined) { fields.push("attachment_url = $" + idx++); values.push(body.attachmentUrl); }
    if (body.orderIndex !== undefined) { fields.push("order_index = $" + idx++); values.push(body.orderIndex); }
    if (body.isPreview !== undefined) { fields.push("is_preview = $" + idx++); values.push(body.isPreview); }

    if (fields.length === 0) {
      return res.status(400).send({ message: "khong co du lieu de cap nhat" });
    }

    fields.push("updated_at = NOW()");
    values.push(req.params.id);

    var result = await pool.query(
      `UPDATE lessons SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay lesson" });
    }

    var row = result.rows[0];

    res.send({
      message: "cap nhat lesson thanh cong",
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
    console.error("update lesson error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      "DELETE FROM lessons WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay lesson" });
    }

    res.send({
      message: "xoa lesson thanh cong",
      id: req.params.id,
    });
  } catch (error) {
    console.error("delete lesson error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

module.exports = router;
