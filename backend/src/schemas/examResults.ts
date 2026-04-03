const examResultStatuses = ["SUBMITTED", "REVIEWED"];

const examResultsSchema = {
  tableName: "exam_results",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
    },

    examSessionId: {
      dbName: "exam_session_id",
      type: "UUID",
      ref: "exam_sessions",
      required: [true, "Exam session is required"],
      unique: true,
    },

    examId: {
      dbName: "exam_id",
      type: "UUID",
      ref: "exams",
      required: [true, "Exam is required"],
      onDelete: "cascade",
    },

    userId: {
      dbName: "user_id",
      type: "UUID",
      ref: "users",
      required: [true, "User is required"],
      onDelete: "cascade",
    },

    answers: {
      type: "JSONB",
      required: [true, "Answers are required"],
      default: [],
    },

    score: {
      type: "NUMERIC(5,2)",
      default: 0,
      min: [0, "Score cannot be negative"],
    },

    correctCount: {
      dbName: "correct_count",
      type: "INTEGER",
      default: 0,
      min: [0, "Correct count cannot be negative"],
    },

    wrongCount: {
      dbName: "wrong_count",
      type: "INTEGER",
      default: 0,
      min: [0, "Wrong count cannot be negative"],
    },

    durationSpentSeconds: {
      dbName: "duration_spent_seconds",
      type: "INTEGER",
      default: 0,
      min: [0, "Duration cannot be negative"],
    },

    status: {
      type: "VARCHAR(20)",
      default: "SUBMITTED",
      enum: examResultStatuses,
      allowedValues: examResultStatuses,
    },

    feedback: {
      type: "TEXT",
    },

    reviewedAt: {
      dbName: "reviewed_at",
      type: "TIMESTAMPTZ",
    },

    submittedAt: {
      dbName: "submitted_at",
      type: "TIMESTAMPTZ",
      default: "NOW()",
    },
  },

  timestamps: true,

  indexes: [
    {
      name: "exam_results_exam_id_idx",
      unique: false,
      columns: ["exam_id"],
    },
    {
      name: "exam_results_user_id_idx",
      unique: false,
      columns: ["user_id"],
    },
    {
      name: "exam_results_exam_session_id_key",
      unique: true,
      columns: ["exam_session_id"],
    },
  ],
};

const createExamResultsTableSql = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id UUID NOT NULL UNIQUE REFERENCES exam_sessions(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count INTEGER NOT NULL DEFAULT 0,
  duration_spent_seconds INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
  feedback TEXT,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exam_results_status_check CHECK (
    status IN ('SUBMITTED', 'REVIEWED')
  ),
  CONSTRAINT exam_results_score_check CHECK (score >= 0),
  CONSTRAINT exam_results_duration_check CHECK (duration_spent_seconds >= 0)
);

CREATE INDEX IF NOT EXISTS exam_results_exam_id_idx ON exam_results (exam_id);
CREATE INDEX IF NOT EXISTS exam_results_user_id_idx ON exam_results (user_id);
`;

module.exports = {
  examResultStatuses,
  examResultsSchema,
  createExamResultsTableSql,
};
