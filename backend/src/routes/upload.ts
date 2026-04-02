var express = require("express");
var multer = require("multer");
var uploadHandler = require("../utils/uploadHandler");

var router = express.Router();

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    var folder = uploadHandler.resolveFolder(req.body && req.body.folder);
    callback(null, uploadHandler.ensureUploadFolder(folder));
  },
  filename: function (req, file, callback) {
    callback(null, uploadHandler.buildStoredFileName(file.originalname));
  },
});

var upload = multer({
  storage: storage,
});

router.post("/single", upload.single("file"), function (req, res, next) {
  if (!req.file) {
    res.status(400).send({
      message: "file la bat buoc",
    });
    return;
  }

  var folder = uploadHandler.resolveFolder(req.body && req.body.folder);
  var fileResponse = uploadHandler.buildFileResponse(req.file, folder);

  res.status(201).send({
    message: "upload file thanh cong",
    file: fileResponse,
  });
});

router.post("/multiple", upload.array("files", 5), function (req, res, next) {
  var files = Array.isArray(req.files) ? req.files : [];

  if (files.length === 0) {
    res.status(400).send({
      message: "files la bat buoc",
    });
    return;
  }

  var folder = uploadHandler.resolveFolder(req.body && req.body.folder);
  var uploadedFiles = files.map(function (file) {
    return uploadHandler.buildFileResponse(file, folder);
  });

  res.status(201).send({
    message: "upload nhieu file thanh cong",
    files: uploadedFiles,
  });
});

module.exports = router;
