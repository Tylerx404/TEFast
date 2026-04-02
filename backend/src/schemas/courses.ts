const { randomUUID } = require("crypto");

const courseCategories = ["TOEIC", "IELTS"];
const courseLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const coursesSchema = {
  tableName: "courses",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
      default: () => randomUUID(),
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

    slug: {
      type: "VARCHAR(255)",
      required: [true, "Slug is required"],
      unique: true,
    },

    description: {
      type: "TEXT",
      required: [true, "Description is required"],
    },

    category: {
      type: "VARCHAR(10)",
      required: [true, "Category is required"],
      enum: courseCategories,
      allowedValues: courseCategories,
    },

    level: {
      type: "VARCHAR(20)",
      required: [true, "Level is required"],
      enum: courseLevels,
      allowedValues: courseLevels,
    },

    price: {
      type: "NUMERIC(12,2)",
      default: 0,
      min: [0, "Price cannot be negative"],
    },

    thumbnailUrl: {
      dbName: "thumbnail_url",
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
      name: "courses_slug_key",
      unique: true,
      columns: ["slug"],
    },
    {
      name: "courses_teacher_id_idx",
      unique: false,
      columns: ["teacher_id"],
    },
    {
      name: "courses_category_idx",
      unique: false,
      columns: ["category"],
    },
  ],
};

const createCoursesTableSql = `
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(10) NOT NULL,
  level VARCHAR(20) NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT courses_category_check CHECK (category IN ('TOEIC', 'IELTS')),
  CONSTRAINT courses_level_check CHECK (
    level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
  )
);

CREATE INDEX IF NOT EXISTS courses_teacher_id_idx ON courses (teacher_id);
CREATE INDEX IF NOT EXISTS courses_category_idx ON courses (category);
`;

module.exports = {
  courseCategories,
  courseLevels,
  coursesSchema,
  createCoursesTableSql,
};
