const lessonContentTypes = ["TEXT", "VIDEO", "AUDIO", "DOCUMENT"];

const lessonsSchema = {
  tableName: "lessons",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
    },

    courseId: {
      dbName: "course_id",
      type: "UUID",
      ref: "courses",
      required: [true, "Course is required"],
      onDelete: "cascade",
    },

    title: {
      type: "VARCHAR(255)",
      required: [true, "Title is required"],
    },

    contentType: {
      dbName: "content_type",
      type: "VARCHAR(20)",
      required: [true, "Content type is required"],
      enum: lessonContentTypes,
      allowedValues: lessonContentTypes,
    },

    content: {
      type: "TEXT",
      required: [true, "Content is required"],
    },

    attachmentUrl: {
      dbName: "attachment_url",
      type: "TEXT",
    },

    orderIndex: {
      dbName: "order_index",
      type: "INTEGER",
      required: [true, "Order index is required"],
    },

    isPreview: {
      dbName: "is_preview",
      type: "BOOLEAN",
      default: false,
    },
  },

  timestamps: true,

  indexes: [
    {
      name: "lessons_course_id_order_index_key",
      unique: true,
      columns: ["course_id", "order_index"],
    },
    {
      name: "lessons_course_id_idx",
      unique: false,
      columns: ["course_id"],
    },
  ],
};

const createLessonsTableSql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content_type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lessons_content_type_check CHECK (
    content_type IN ('TEXT', 'VIDEO', 'AUDIO', 'DOCUMENT')
  ),
  CONSTRAINT lessons_course_order_unique UNIQUE (course_id, order_index)
);

CREATE INDEX IF NOT EXISTS lessons_course_id_idx ON lessons (course_id);
`;

module.exports = {
  lessonContentTypes,
  lessonsSchema,
  createLessonsTableSql,
};
