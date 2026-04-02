var express = require("express");

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
  res.send({
    message: "server dang chay",
    service: process.env.APP_NAME || "tefast-backend",
    status: "ok",
    runtime: "bun",
    postgres: process.env.DATABASE_URL ? "configured" : "missing",
    redis: process.env.REDIS_URL ? "configured" : "missing",
    time: new Date().toISOString(),
  });
});

module.exports = router;
