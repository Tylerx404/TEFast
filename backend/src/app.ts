var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var Pool = require("pg").Pool;

var app = express();
var PORT = Number(process.env.PORT) || 3001;
var HOST = process.env.HOST || "127.0.0.1";
var DATABASE_URL =
  process.env.DATABASE_URL || "postgres://user:password@localhost:5432/tefast_db";

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
console.log("da connect postgres");

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
  res.status(err.status || 500).send({
    message: err.message || "server error",
  });
});

if (require.main === module) {
  app.listen(PORT, HOST, function () {
    console.log("Server running at http://" + HOST + ":" + PORT);
  });
}

module.exports = app;
