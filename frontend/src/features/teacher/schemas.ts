import { z } from "zod";

export const teacherCourseSchema = z.object({
  title: z.string().min(3, "Tiêu đề cần ít nhất 3 ký tự"),
  slug: z.string().min(3, "Slug cần ít nhất 3 ký tự"),
  description: z.string().min(10, "Mô tả cần ít nhất 10 ký tự"),
  category: z.enum(["TOEIC", "IELTS"]),
  level: z.string().min(2, "Level là bắt buộc"),
  price: z.number().min(0, "Giá không hợp lệ"),
  thumbnailUrl: z.string(),
  isPublished: z.enum(["true", "false"]),
});

export const teacherLessonSchema = z.object({
  title: z.string().min(3, "Tiêu đề cần ít nhất 3 ký tự"),
  contentType: z.string().min(2, "Loại nội dung là bắt buộc"),
  content: z.string().min(3, "Nội dung là bắt buộc"),
  attachmentUrl: z.string(),
  orderIndex: z.number().min(1, "Thứ tự phải lớn hơn 0"),
  isPreview: z.enum(["true", "false"]),
});

export const teacherLessonOrderSchema = z.object({
  orderIndex: z.number().min(1, "Thứ tự phải lớn hơn 0"),
});

export const teacherExamSchema = z.object({
  courseId: z.string().min(1, "Khóa học là bắt buộc"),
  title: z.string().min(3, "Tiêu đề cần ít nhất 3 ký tự"),
  category: z.enum(["TOEIC", "IELTS"]),
  examType: z.string().min(2, "Loại đề là bắt buộc"),
  durationMinutes: z.number().min(1, "Thời lượng phải lớn hơn 0"),
  instructions: z.string().min(10, "Hướng dẫn cần ít nhất 10 ký tự"),
});

export const teacherQuestionSchema = z.object({
  section: z.string().min(2, "Section là bắt buộc"),
  content: z.string().min(5, "Nội dung câu hỏi cần ít nhất 5 ký tự"),
  options: z
    .array(
      z.object({
        value: z.string(),
      }),
    )
    .min(2, "Cần ít nhất 2 lựa chọn"),
  correctAnswer: z.string().min(1, "Đáp án đúng là bắt buộc"),
  explanation: z.string().min(2, "Giải thích là bắt buộc"),
  orderIndex: z.number().min(1, "Thứ tự phải lớn hơn 0"),
});

export const teacherResultReviewSchema = z.object({
  feedback: z.string().min(2, "Feedback là bắt buộc"),
  manualScore: z.number().min(0, "Điểm không hợp lệ"),
});

export const teacherVocabularySchema = z.object({
  word: z.string().min(1, "Từ vựng là bắt buộc"),
  phonetic: z.string(),
  meaning: z.string().min(1, "Nghĩa là bắt buộc"),
  example: z.string(),
  category: z.enum(["TOEIC", "IELTS"]),
  topic: z.string(),
  level: z.string(),
  audioUrl: z.string(),
  imageUrl: z.string(),
});
