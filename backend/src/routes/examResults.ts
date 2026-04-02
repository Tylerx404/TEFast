var express = require("express");
var helper = require("../utils/helper");
var examResultsModule = require("../schemas/examResults");

var router = express.Router();
var examResultStatuses = examResultsModule.examResultStatuses;

function buildExamResult(id, payload: any = {}) {
  return {
    id: id,
    examId: payload.examId || "exm_1",
    userId: payload.userId || "usr_1",
    examTitle: payload.examTitle || "IELTS Speaking Mock Test 01",
    score: payload.score ?? 85,
    correctCount: payload.correctCount ?? 26,
    wrongCount: payload.wrongCount ?? 4,
    durationSpentSeconds: payload.durationSpentSeconds ?? 1780,
    feedback: payload.feedback ?? null,
    status: payload.status || "SUBMITTED",
    reviewedAt: payload.reviewedAt || null,
    submittedAt: payload.submittedAt || helper.nowIso(),
    createdAt: payload.createdAt || helper.nowIso(),
    updatedAt: payload.updatedAt || helper.nowIso(),
  };
}

router.get("/my", function (req, res, next) {
  var page = Number(req.query.page) || 1;
  var limit = Number(req.query.limit) || 10;
  var result = buildExamResult("rst_1");

  res.send({
    message: "lay ket qua cua toi thanh cong",
    results: [result],
    pagination: {
      page: page,
      limit: limit,
      total: 1,
      totalPages: 1,
    },
  });
});

router.post("/", function (req, res, next) {
  var body = req.body || {};

  if (!body.examId || !body.userId) {
    res.status(400).send({
      message: "examId va userId la bat buoc",
    });
    return;
  }

  var result = buildExamResult(helper.createId("rst"), {
    examId: body.examId,
    userId: body.userId,
    score: body.score ?? 85,
    correctCount: body.correctCount ?? 26,
    wrongCount: body.wrongCount ?? 4,
    durationSpentSeconds: body.durationSpentSeconds ?? 1780,
    submittedAt: helper.nowIso(),
  });

  res.status(201).send({
    message: "nop bai thanh cong",
    result: result,
  });
});

router.patch("/:id/review", function (req, res, next) {
  var body = req.body || {};
  var status = body.status || "REVIEWED";

  if (!examResultStatuses.includes(status)) {
    res.status(422).send({
      message: "status khong hop le",
    });
    return;
  }

  res.send({
    message: "review bai thi thanh cong",
    result: {
      id: req.params.id,
      score: body.manualScore ?? body.score ?? 87,
      feedback: body.feedback || "Can luyen them phan pronunciation",
      reviewedAt: helper.nowIso(),
      status: status,
    },
  });
});

router.get("/:id", function (req, res, next) {
  var result = buildExamResult(req.params.id);

  res.send(result);
});

module.exports = router;
