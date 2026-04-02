const { randomUUID } = require("crypto");
const { courseCategories, courseLevels } = require("./courses");

const vocabularySchema = {
  tableName: "vocabulary",
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

    word: {
      type: "VARCHAR(150)",
      required: [true, "Word is required"],
    },

    phonetic: {
      type: "VARCHAR(100)",
    },

    meaning: {
      type: "TEXT",
      required: [true, "Meaning is required"],
    },

    example: {
      type: "TEXT",
    },

    category: {
      type: "VARCHAR(10)",
      required: [true, "Category is required"],
      enum: courseCategories,
      allowedValues: courseCategories,
    },

    topic: {
      type: "VARCHAR(100)",
    },

    level: {
      type: "VARCHAR(20)",
      required: [true, "Level is required"],
      enum: courseLevels,
      allowedValues: courseLevels,
    },

    audioUrl: {
      dbName: "audio_url",
      type: "TEXT",
    },

    imageUrl: {
      dbName: "image_url",
      type: "TEXT",
    },

    isPublished: {
      dbName: "is_published",
      type: "BOOLEAN",
      default: false,
    },
  },

  timestamps: true,

  indexes: [
    {
      name: "vocabulary_teacher_id_idx",
      unique: false,
      columns: ["teacher_id"],
    },
    {
      name: "vocabulary_category_topic_idx",
      unique: false,
      columns: ["category", "topic"],
    },
    {
      name: "vocabulary_word_idx",
      unique: false,
      columns: ["word"],
    },
  ],
};

const createVocabularyTableSql = `
CREATE TABLE IF NOT EXISTS vocabulary (
  id UUID PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  word VARCHAR(150) NOT NULL,
  phonetic VARCHAR(100),
  meaning TEXT NOT NULL,
  example TEXT,
  category VARCHAR(10) NOT NULL,
  topic VARCHAR(100),
  level VARCHAR(20) NOT NULL,
  audio_url TEXT,
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT vocabulary_category_check CHECK (category IN ('TOEIC', 'IELTS')),
  CONSTRAINT vocabulary_level_check CHECK (
    level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')
  )
);

CREATE INDEX IF NOT EXISTS vocabulary_teacher_id_idx ON vocabulary (teacher_id);
CREATE INDEX IF NOT EXISTS vocabulary_category_topic_idx
  ON vocabulary (category, topic);
CREATE INDEX IF NOT EXISTS vocabulary_word_idx ON vocabulary (word);
`;

module.exports = {
  vocabularySchema,
  createVocabularyTableSql,
};
