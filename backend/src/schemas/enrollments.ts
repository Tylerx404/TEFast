const enrollmentStatuses = ["ACTIVE", "COMPLETED", "CANCELLED"];

const enrollmentsSchema = {
  tableName: "enrollments",
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

    userId: {
      dbName: "user_id",
      type: "UUID",
      ref: "users",
      required: [true, "User is required"],
      onDelete: "cascade",
    },

    status: {
      type: "VARCHAR(20)",
      default: "ACTIVE",
      enum: enrollmentStatuses,
      allowedValues: enrollmentStatuses,
    },

    progressPercent: {
      dbName: "progress_percent",
      type: "NUMERIC(5,2)",
      default: 0,
      min: [0, "Progress percent cannot be negative"],
      max: [100, "Progress percent cannot be greater than 100"],
    },

    lastLessonId: {
      dbName: "last_lesson_id",
      type: "UUID",
      ref: "lessons",
      onDelete: "set null",
    },

    enrolledAt: {
      dbName: "enrolled_at",
      type: "TIMESTAMPTZ",
      default: "NOW()",
    },

    completedAt: {
      dbName: "completed_at",
      type: "TIMESTAMPTZ",
    },
  },

  timestamps: true,

  indexes: [
    {
      name: "enrollments_course_id_user_id_key",
      unique: true,
      columns: ["course_id", "user_id"],
    },
    {
      name: "enrollments_user_id_idx",
      unique: false,
      columns: ["user_id"],
    },
    {
      name: "enrollments_course_id_idx",
      unique: false,
      columns: ["course_id"],
    },
  ],
};

const createEnrollmentsTableSql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  last_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enrollments_status_check CHECK (
    status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')
  ),
  CONSTRAINT enrollments_progress_percent_check CHECK (
    progress_percent >= 0 AND progress_percent <= 100
  ),
  CONSTRAINT enrollments_course_user_unique UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments (user_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON enrollments (course_id);
`;

module.exports = {
  enrollmentStatuses,
  enrollmentsSchema,
  createEnrollmentsTableSql,
};
