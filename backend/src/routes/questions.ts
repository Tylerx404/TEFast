var express = require("express");
var helper = require("../utils/helper");
var questionsModule = require("../schemas/questions");

var router = express.Router();
var questionSections = questionsModule.questionSections;

router.get("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      "SELECT * FROM questions WHERE id = $1 LIMIT 1",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay cau hoi" });
    }

    var row = result.rows[0];

    res.send({
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
    });
  } catch (error) {
    console.error("get question error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.patch("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;
    var body = req.body || {};

    if (body.section && !questionSections.includes(body.section)) {
      return res.status(422).send({ message: "section khong hop le" });
    }

    var fields: string[] = [];
    var values: any[] = [];
    var idx = 1;

    if (body.section !== undefined) { fields.push("section = $" + idx++); values.push(body.section); }
    if (body.content !== undefined) { fields.push("content = $" + idx++); values.push(body.content); }
    if (body.options !== undefined) { fields.push("options = $" + idx++); values.push(JSON.stringify(body.options)); }
    if (body.correctAnswer !== undefined) { fields.push("correct_answer = $" + idx++); values.push(JSON.stringify(body.correctAnswer)); }
    if (body.explanation !== undefined) { fields.push("explanation = $" + idx++); values.push(body.explanation); }
    if (body.orderIndex !== undefined) { fields.push("order_index = $" + idx++); values.push(body.orderIndex); }
    if (body.audioUrl !== undefined) { fields.push("audio_url = $" + idx++); values.push(body.audioUrl); }
    if (body.imageUrl !== undefined) { fields.push("image_url = $" + idx++); values.push(body.imageUrl); }

    if (fields.length === 0) {
      return res.status(400).send({ message: "khong co du lieu de cap nhat" });
    }

    fields.push("updated_at = NOW()");
    values.push(req.params.id);

    var result = await pool.query(
      `UPDATE questions SET ${fields.join(", ")}
       WHERE id = $${idx}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay cau hoi" });
    }

    var row = result.rows[0];

    res.send({
      message: "cap nhat cau hoi thanh cong",
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
    console.error("update question error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    var pool = req.app.locals.pg;

    var result = await pool.query(
      "DELETE FROM questions WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "khong tim thay cau hoi" });
    }

    res.send({
      message: "xoa cau hoi thanh cong",
      id: req.params.id,
    });
  } catch (error) {
    console.error("delete question error:", error);
    res.status(500).send({ message: "loi he thong" });
  }
});

module.exports = router;
