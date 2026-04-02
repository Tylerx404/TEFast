const { randomUUID } = require("crypto");

const commentStatuses = ["ACTIVE", "HIDDEN", "DELETED"];

const commentsSchema = {
  tableName: "comments",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
      default: () => randomUUID(),
    },

    userId: {
      dbName: "user_id",
      type: "UUID",
      ref: "users",
      required: [true, "User is required"],
      onDelete: "cascade",
    },

    courseId: {
      dbName: "course_id",
      type: "UUID",
      ref: "courses",
      onDelete: "cascade",
    },

    lessonId: {
      dbName: "lesson_id",
      type: "UUID",
      ref: "lessons",
      onDelete: "cascade",
    },

    parentCommentId: {
      dbName: "parent_comment_id",
      type: "UUID",
      ref: "comments",
      onDelete: "cascade",
    },

    content: {
      type: "TEXT",
      required: [true, "Content is required"],
    },

    status: {
      type: "VARCHAR(20)",
      default: "ACTIVE",
      enum: commentStatuses,
      allowedValues: commentStatuses,
    },
  },

  timestamps: true,

  indexes: [
    {
      name: "comments_course_id_idx",
      unique: false,
      columns: ["course_id"],
    },
    {
      name: "comments_lesson_id_idx",
      unique: false,
      columns: ["lesson_id"],
    },
    {
      name: "comments_parent_comment_id_idx",
      unique: false,
      columns: ["parent_comment_id"],
    },
    {
      name: "comments_user_id_idx",
      unique: false,
      columns: ["user_id"],
    },
  ],
};

const createCommentsTableSql = `
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT comments_status_check CHECK (
    status IN ('ACTIVE', 'HIDDEN', 'DELETED')
  ),
  CONSTRAINT comments_target_check CHECK (
    course_id IS NOT NULL OR lesson_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS comments_course_id_idx ON comments (course_id);
CREATE INDEX IF NOT EXISTS comments_lesson_id_idx ON comments (lesson_id);
CREATE INDEX IF NOT EXISTS comments_parent_comment_id_idx
  ON comments (parent_comment_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments (user_id);
`;

module.exports = {
  commentStatuses,
  commentsSchema,
  createCommentsTableSql,
};
