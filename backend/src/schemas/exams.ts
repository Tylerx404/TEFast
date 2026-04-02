const { randomUUID } = require("crypto");
const { courseCategories } = require("./courses");

const examTypes = ["MINI_TEST", "FULL_TEST", "PRACTICE"];

const examsSchema = {
  tableName: "exams",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
      default: () => randomUUID(),
    },

    courseId: {
      dbName: "course_id",
      type: "UUID",
      ref: "courses",
      required: [true, "Course is required"],
      onDelete: "cascade",
    },

    teacherId: {
      dbName: "teacher_id",
      type: "UUID",
      ref: "users",
      required: [true, "Teacher is required"],
      onDelete: "restrict",
    },

    title: {
      type: "VARCHAR(255)",
      required: [true, "Title is required"],
    },

    category: {
      type: "VARCHAR(10)",
      required: [true, "Category is required"],
      enum: courseCategories,
      allowedValues: courseCategories,
    },

    examType: {
      dbName: "exam_type",
      type: "VARCHAR(20)",
      required: [true, "Exam type is required"],
      enum: examTypes,
      allowedValues: examTypes,
    },

    durationMinutes: {
      dbName: "duration_minutes",
      type: "INTEGER",
      required: [true, "Duration is required"],
      min: [1, "Duration must be greater than 0"],
    },

    instructions: {
      type: "TEXT",
    },

    isPublished: {
      dbName: "is_published",
      type: "BOOLEAN",
      default: false,
    },

    publishedAt: {
      dbName: "published_at",
      type: "TIMESTAMPTZ",
    },
  },

  timestamps: true,

  indexes: [
    {
      name: "exams_course_id_idx",
      unique: false,
      columns: ["course_id"],
    },
    {
      name: "exams_teacher_id_idx",
      unique: false,
      columns: ["teacher_id"],
    },
    {
      name: "exams_category_exam_type_idx",
      unique: false,
      columns: ["category", "exam_type"],
    },
  ],
};

const createExamsTableSql = `
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(10) NOT NULL,
  exam_type VARCHAR(20) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  instructions TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exams_category_check CHECK (category IN ('TOEIC', 'IELTS')),
  CONSTRAINT exams_exam_type_check CHECK (
    exam_type IN ('MINI_TEST', 'FULL_TEST', 'PRACTICE')
  ),
  CONSTRAINT exams_duration_minutes_check CHECK (duration_minutes > 0)
);

CREATE INDEX IF NOT EXISTS exams_course_id_idx ON exams (course_id);
CREATE INDEX IF NOT EXISTS exams_teacher_id_idx ON exams (teacher_id);
CREATE INDEX IF NOT EXISTS exams_category_exam_type_idx
  ON exams (category, exam_type);
`;

module.exports = {
  examTypes,
  examsSchema,
  createExamsTableSql,
};
