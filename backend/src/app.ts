var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var Pool = require("pg").Pool;
var helper = require("./utils/helper");
var mailHandler = require("./utils/mailHandler");

var app = express();
var PORT = Number(process.env.PORT) || 3001;
var HOST = process.env.HOST || "127.0.0.1";
var DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tefast";

app.disable("x-powered-by");
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

var pool = new Pool({
  connectionString: DATABASE_URL,
});

app.locals.pg = pool;

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/courses", require("./routes/courses"));
app.use("/lessons", require("./routes/lessons"));
app.use("/exams", require("./routes/exams"));
app.use("/questions", require("./routes/questions"));
app.use("/exam-results", require("./routes/examResults"));
app.use("/comments", require("./routes/comments"));
app.use("/enrollments", require("./routes/enrollments"));
app.use("/upload", require("./routes/upload"));
app.use("/vocabulary", require("./routes/vocabulary"));

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  helper.sendError(res, err.status || 500, err.message || "Internal server error");
});

if (require.main === module) {
  pool
    .query("SELECT 1")
    .then(function () {
      console.log("da connect postgres");
      app.listen(PORT, HOST, function () {
        console.log("Server running at http://" + HOST + ":" + PORT);

        mailHandler.warmupTransporter().then(function (result) {
          if (result && result.success) {
            console.log("smtp transporter is ready");
            return;
          }

          console.warn(
            "smtp transporter warmup failed:",
            (result && result.message) || "unknown error",
          );
        });
      });
    })
    .catch(function (error) {
      console.error("database setup error:", error);
      process.exit(1);
    });
}

module.exports = app;
