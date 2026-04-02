var express = require("express");
var multer = require("multer");
var helper = require("../utils/helper");
var uploadHandler = require("../utils/uploadHandler");
var authHandler = require("../utils/authHandler");

var router = express.Router();
var checkLogin = authHandler.checkLogin;
var checkRole = authHandler.checkRole;

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

router.post(
  "/single",
  checkLogin,
  checkRole("TEACHER", "ADMIN"),
  upload.single("file"),
  function (req, res, next) {
    if (!req.file) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "file",
          message: "File is required",
        },
      ]);
      return;
    }

    var folder = uploadHandler.resolveFolder(req.body && req.body.folder);
    var fileResponse = uploadHandler.buildFileResponse(req.file, folder);

    helper.sendCreated(res, "File uploaded successfully", fileResponse);
  },
);

router.post(
  "/multiple",
  checkLogin,
  checkRole("TEACHER", "ADMIN"),
  upload.array("files", 5),
  function (req, res, next) {
    var files = Array.isArray(req.files) ? req.files : [];

    if (files.length === 0) {
      helper.sendError(res, 400, "Validation failed", [
        {
          field: "files",
          message: "At least one file is required",
        },
      ]);
      return;
    }

    var folder = uploadHandler.resolveFolder(req.body && req.body.folder);
    var uploadedFiles = files.map(function (file) {
      return uploadHandler.buildFileResponse(file, folder);
    });

    helper.sendCreated(res, "Files uploaded successfully", uploadedFiles);
  },
);

module.exports = router;
