var express = require("express");
var helper = require("../utils/helper");
var coursesModule = require("../schemas/courses");

var router = express.Router();
var courseCategories = coursesModule.courseCategories;
var courseLevels = coursesModule.courseLevels;

function buildVocabulary(id, payload: any = {}) {
  return {
    id: id,
    word: payload.word || "contract",
    phonetic: payload.phonetic || "/contract/",
    meaning: payload.meaning || "hop dong",
    example: payload.example || "We signed the contract yesterday.",
    category: payload.category || "TOEIC",
    topic: payload.topic || "Business",
    level: payload.level || "BEGINNER",
    audioUrl: payload.audioUrl || "/uploads/audio/contract.mp3",
    imageUrl: payload.imageUrl || "/uploads/images/contract.jpg",
    createdAt: payload.createdAt || helper.nowIso(),
    updatedAt: payload.updatedAt || helper.nowIso(),
  };
}

router.get("/topics", function (req, res, next) {
  res.send([
    {
      topic: "Business",
      totalWords: 120,
    },
    {
      topic: "Travel",
      totalWords: 80,
    },
  ]);
});

router.get("/", function (req, res, next) {
  var page = Number(req.query.page) || 1;
  var limit = Number(req.query.limit) || 10;
  var item = buildVocabulary("voc_1", {
    category: courseCategories.includes(req.query.category) ? req.query.category : "TOEIC",
    topic: req.query.topic || "Business",
    level: courseLevels.includes(req.query.level) ? req.query.level : "BEGINNER",
    word: req.query.keyword || "contract",
  });

  res.send({
    message: "lay tu vung thanh cong",
    vocabulary: [item],
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

  if (!body.word || !body.meaning || !body.category || !body.level) {
    res.status(400).send({
      message: "word, meaning, category va level la bat buoc",
    });
    return;
  }

  if (!courseCategories.includes(body.category) || !courseLevels.includes(body.level)) {
    res.status(422).send({
      message: "category hoac level khong hop le",
    });
    return;
  }

  var item = buildVocabulary(helper.createId("voc"), body);

  res.status(201).send({
    message: "them tu vung thanh cong",
    vocabulary: item,
  });
});

router.get("/:id", function (req, res, next) {
  var item = buildVocabulary(req.params.id);

  res.send(item);
});

router.patch("/:id", function (req, res, next) {
  var body = req.body || {};
  var item = buildVocabulary(req.params.id, {
    word: body.word,
    phonetic: body.phonetic,
    meaning: body.meaning,
    example: body.example,
    category: body.category,
    topic: body.topic,
    level: body.level,
    audioUrl: body.audioUrl,
    imageUrl: body.imageUrl,
    updatedAt: helper.nowIso(),
  });

  res.send({
    message: "cap nhat tu vung thanh cong",
    vocabulary: item,
  });
});

router.delete("/:id", function (req, res, next) {
  res.send({
    message: "xoa tu vung thanh cong",
    id: req.params.id,
  });
});

module.exports = router;
