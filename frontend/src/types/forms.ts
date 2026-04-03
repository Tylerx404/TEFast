import type { ExamCategory } from "@/types/domain";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
};

export type ProfileFormValues = {
  fullName: string;
  phone: string;
  avatarUrl: string;
  targetExam: ExamCategory | "";
};

export type CourseFilters = {
  page?: string;
  limit?: string;
  category?: ExamCategory | "";
  teacherId?: string;
  keyword?: string;
  isPublished?: string;
};

export type EnrollmentFilters = {
  page?: string;
  limit?: string;
  status?: string;
  category?: ExamCategory | "";
};

export type ResultFilters = {
  page?: string;
  limit?: string;
  examId?: string;
  courseId?: string;
};

export type VocabularyFilters = {
  page?: string;
  limit?: string;
  category?: ExamCategory | "";
  topic?: string;
  level?: string;
  keyword?: string;
};

export type TeacherCourseFormValues = {
  title: string;
  slug: string;
  description: string;
  category: ExamCategory;
  level: string;
  price: number;
  thumbnailUrl: string;
  isPublished: "true" | "false";
};

export type TeacherLessonFormValues = {
  title: string;
  contentType: string;
  content: string;
  attachmentUrl: string;
  orderIndex: number;
  isPreview: "true" | "false";
};

export type TeacherExamFormValues = {
  courseId: string;
  title: string;
  category: ExamCategory;
  examType: string;
  durationMinutes: number;
  instructions: string;
  isPublished: "true" | "false";
};

export type TeacherQuestionFormValues = {
  section: string;
  content: string;
  options: { value: string }[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
  audioUrl: string;
  imageUrl: string;
};

export type TeacherResultReviewFormValues = {
  feedback: string;
  manualScore: number;
};

export type TeacherVocabularyFormValues = {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: ExamCategory;
  topic: string;
  level: string;
  audioUrl: string;
  imageUrl: string;
  isPublished: "true" | "false";
};

export type AdminUserFilters = {
  page?: string;
  limit?: string;
  role?: string;
  keyword?: string;
  status?: string;
};

export type AdminRoleFormValues = {
  role: "STUDENT" | "TEACHER" | "ADMIN";
};
