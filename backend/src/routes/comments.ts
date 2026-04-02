var express = require("express");
var helper = require("../utils/helper");
var commentsModule = require("../schemas/comments");

var router = express.Router();
var commentStatuses = commentsModule.commentStatuses;

function buildComment(id, payload: any = {}) {
  return {
    id: id,
    courseId: payload.courseId || "crs_1",
    lessonId: payload.lessonId || "les_1",
    parentCommentId: payload.parentCommentId ?? null,
    content: payload.content || "Bai hoc rat de hieu",
    user: payload.user || {
      id: "usr_1",
      fullName: "Nguyen Van A",
    },
    status: payload.status || "ACTIVE",
    createdAt: payload.createdAt || helper.nowIso(),
    updatedAt: payload.updatedAt || helper.nowIso(),
  };
}

router.get("/", function (req, res, next) {
  var comment = buildComment("cmt_1", {
    courseId: req.query.courseId || "crs_1",
    lessonId: req.query.lessonId || "les_1",
    parentCommentId: req.query.parentCommentId || null,
  });

  res.send({
    message: "lay comment thanh cong",
    comments: [comment],
  });
});

router.post("/", function (req, res, next) {
  var body = req.body || {};

  if (!body.content) {
    res.status(400).send({
      message: "content la bat buoc",
    });
    return;
  }

  var comment = buildComment(helper.createId("cmt"), {
    courseId: body.courseId,
    lessonId: body.lessonId,
    parentCommentId: body.parentCommentId,
    content: body.content,
  });

  res.status(201).send({
    message: "them comment thanh cong",
    comment: comment,
  });
});

router.get("/:id", function (req, res, next) {
  var comment = buildComment(req.params.id);

  res.send(comment);
});

router.patch("/:id", function (req, res, next) {
  var body = req.body || {};
  var status = body.status || "ACTIVE";

  if (!commentStatuses.includes(status)) {
    res.status(422).send({
      message: "status khong hop le",
    });
    return;
  }

  var comment = buildComment(req.params.id, {
    content: body.content || "Bai hoc rat de hieu va thuc te",
    status: status,
    updatedAt: helper.nowIso(),
  });

  res.send({
    message: "cap nhat comment thanh cong",
    comment: comment,
  });
});

router.delete("/:id", function (req, res, next) {
  res.send({
    message: "xoa comment thanh cong",
    id: req.params.id,
  });
});

module.exports = router;
