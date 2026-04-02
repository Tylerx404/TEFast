const { randomUUID } = require("crypto");

const questionSections = [
  "PART_1",
  "PART_2",
  "PART_3",
  "PART_4",
  "PART_5",
  "PART_6",
  "PART_7",
  "LISTENING",
  "READING",
  "SPEAKING",
  "WRITING",
];

const questionsSchema = {
  tableName: "questions",
  columns: {
    id: {
      type: "UUID",
      primaryKey: true,
      default: () => randomUUID(),
    },

    examId: {
      dbName: "exam_id",
      type: "UUID",
      ref: "exams",
      required: [true, "Exam is required"],
      onDelete: "cascade",
    },

    section: {
      type: "VARCHAR(20)",
      required: [true, "Section is required"],
      enum: questionSections,
      allowedValues: questionSections,
    },

    content: {
      type: "TEXT",
      required: [true, "Content is required"],
    },

    options: {
      type: "JSONB",
      required: [true, "Options are required"],
      default: [],
    },

    correctAnswer: {
      dbName: "correct_answer",
      type: "JSONB",
      required: [true, "Correct answer is required"],
    },

    explanation: {
      type: "TEXT",
    },

    orderIndex: {
      dbName: "order_index",
      type: "INTEGER",
      required: [true, "Order index is required"],
    },

    audioUrl: {
      dbName: "audio_url",
      type: "TEXT",
    },

    imageUrl: {
      dbName: "image_url",
      type: "TEXT",
    },
  },

  timestamps: true,

  indexes: [
    {
      name: "questions_exam_id_idx",
      unique: false,
      columns: ["exam_id"],
    },
    {
      name: "questions_exam_id_order_index_key",
      unique: true,
      columns: ["exam_id", "order_index"],
    },
  ],
};

const createQuestionsTableSql = `
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  section VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer JSONB NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  audio_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT questions_section_check CHECK (
    section IN (
      'PART_1', 'PART_2', 'PART_3', 'PART_4', 'PART_5',
      'PART_6', 'PART_7', 'LISTENING', 'READING', 'SPEAKING', 'WRITING'
    )
  ),
  CONSTRAINT questions_exam_order_unique UNIQUE (exam_id, order_index)
);

CREATE INDEX IF NOT EXISTS questions_exam_id_idx ON questions (exam_id);
`;

module.exports = {
  questionSections,
  questionsSchema,
  createQuestionsTableSql,
};
