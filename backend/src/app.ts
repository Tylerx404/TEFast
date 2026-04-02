const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { Pool } = require('pg');

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const DATABASE_URL =
  process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/tefast_db';

app.disable('x-powered-by');
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Kết nối PostgreSQL
const pool = new Pool({
  connectionString: DATABASE_URL
});
app.locals.pg = pool;
console.log("da connect postgres");

// localhost:3000
app.use('/', require('./routes/index').indexRouter);
// localhost:3000/auth
app.use('/auth', require('./routes/auth').authRouter);
// localhost:3000/users
app.use('/users', require('./routes/users').usersRouter);
// localhost:3000/courses
app.use('/courses', require('./routes/courses').coursesRouter);
// localhost:3000/lessons
app.use('/lessons', require('./routes/lessons').lessonsRouter);
// localhost:3000/exams
app.use('/exams', require('./routes/exams').examsRouter);
// localhost:3000/questions
app.use('/questions', require('./routes/questions').questionsRouter);
// localhost:3000/exam-results
app.use('/exam-results', require('./routes/examResults').examResultsRouter);
// localhost:3000/comments
app.use('/comments', require('./routes/comments').commentsRouter);
// localhost:3000/enrollments
app.use('/enrollments', require('./routes/enrollments').enrollmentsRouter);
// localhost:3000/upload
app.use('/upload', require('./routes/upload').uploadRouter);
// localhost:3000/vocabulary
app.use('/vocabulary', require('./routes/vocabulary').vocabularyRouter);

// catch 404 and forward to error handler
app.use(function (req: any, res: any, next: any) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send({
    message: err.message
  });
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });
}

module.exports = app;
