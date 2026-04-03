var Pool = require("pg").Pool;
var rolesModule = require("../schemas/roles");
var usersModule = require("../schemas/users");
var coursesModule = require("../schemas/courses");
var lessonsModule = require("../schemas/lessons");
var examsModule = require("../schemas/exams");
var questionsModule = require("../schemas/questions");
var enrollmentsModule = require("../schemas/enrollments");
var commentsModule = require("../schemas/comments");
var vocabularyModule = require("../schemas/vocabulary");
var examResultsModule = require("../schemas/examResults");

var DATABASE_URL =
  process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/tefast";

var statements = [
  {
    name: "roles",
    sql: rolesModule.createRolesTableSql,
  },
  {
    name: "users",
    sql: usersModule.createUsersTableSql,
  },
  {
    name: "courses",
    sql: coursesModule.createCoursesTableSql,
  },
  {
    name: "lessons",
    sql: lessonsModule.createLessonsTableSql,
  },
  {
    name: "exams",
    sql: examsModule.createExamsTableSql,
  },
  {
    name: "exam_sessions",
    sql: examsModule.createExamSessionsTableSql,
  },
  {
    name: "questions",
    sql: questionsModule.createQuestionsTableSql,
  },
  {
    name: "enrollments",
    sql: enrollmentsModule.createEnrollmentsTableSql,
  },
  {
    name: "comments",
    sql: commentsModule.createCommentsTableSql,
  },
  {
    name: "vocabulary",
    sql: vocabularyModule.createVocabularyTableSql,
  },
  {
    name: "exam_results",
    sql: examResultsModule.createExamResultsTableSql,
  },
];

async function main() {
  var pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    for (var i = 0; i < statements.length; i++) {
      var statement = statements[i];

      if (!statement) {
        continue;
      }

      await pool.query(statement.sql);
      console.log("db bootstrap ok:", statement.name);
    }

    await pool.query(rolesModule.seedRolesSql);
    console.log("db bootstrap ok: seed_roles");
  } catch (error) {
    console.error("db bootstrap error:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
