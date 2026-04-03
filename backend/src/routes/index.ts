var express = require("express");
var helper = require("../utils/helper");

var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("index", {
    title: process.env.APP_NAME || "TEFast",
    message: "TEFast backend is running",
  });
});

router.get("/home", function (req, res, next) {
  res.render("index", {
    title: process.env.APP_NAME || "TEFast",
    message: "TEFast backend is running",
  });
});

router.get("/health", function (req, res, next) {
  helper.sendSuccess(res, "Health fetched", {
    service: process.env.APP_NAME || "tefast-backend",
    status: "ok",
    runtime: "bun",
    timestamp: new Date().toISOString(),
    dependencies: {
      postgres: process.env.DATABASE_URL ? "configured" : "missing",
      redis: process.env.REDIS_URL ? "configured" : "missing",
    },
  });
});

module.exports = router;
