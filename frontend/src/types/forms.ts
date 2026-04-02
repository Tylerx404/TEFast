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
