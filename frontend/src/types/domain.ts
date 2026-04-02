export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
export type ExamCategory = "TOEIC" | "IELTS";

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type UserProfile = SessionUser & {
  targetExam?: ExamCategory | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TeacherSummary = {
  id: string;
  fullName: string;
};

export type CourseListItem = {
  id: string;
  title: string;
  slug: string;
  category: ExamCategory;
  level: string;
  thumbnailUrl?: string | null;
  teacher?: TeacherSummary | null;
  isPublished: boolean;
};

export type CourseLesson = {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  isPreview: boolean;
};

export type CourseDetail = CourseListItem & {
  description?: string | null;
  price?: number | null;
  stats?: {
    lessonCount: number;
    examCount: number;
    enrollmentCount: number;
  } | null;
};

export type EnrollmentItem = {
  id: string;
  courseId: string;
  courseTitle: string;
  progressPercent: number;
  status: string;
};

export type EnrollmentDetail = {
  id: string;
  courseId: string;
  userId: string;
  status: string;
  progressPercent: number;
  enrolledAt: string;
  completedAt?: string | null;
  lastLessonId?: string | null;
};

export type LessonDetail = {
  id: string;
  courseId: string;
  title: string;
  contentType: string;
  content: string;
  attachmentUrl?: string | null;
  orderIndex: number;
  isPreview: boolean;
};

export type ExamListItem = {
  id: string;
  title: string;
  category: ExamCategory;
  examType: string;
  durationMinutes: number;
  totalQuestions: number;
};

export type ExamDetail = ExamListItem & {
  instructions?: string | null;
  courseId?: string | null;
};

export type ExamSession = {
  examSessionId: string;
  examId: string;
  startedAt: string;
  expiresAt: string;
};

export type QuestionItem = {
  id: string;
  examId: string;
  section: string;
  content: string;
  options: string[];
  orderIndex: number;
  audioUrl?: string | null;
  imageUrl?: string | null;
  explanation?: string | null;
};

export type ExamAnswerPayload = {
  questionId: string;
  selectedAnswer: string;
};

export type ExamResultSummary = {
  id: string;
  examId: string;
  examTitle?: string;
  score: number;
  submittedAt: string;
};

export type ExamResultDetail = {
  id: string;
  examId: string;
  userId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  durationSpentSeconds: number;
  feedback?: string | null;
  submittedAt: string;
};

export type VocabularyItem = {
  id: string;
  word: string;
  meaning: string;
  category?: ExamCategory;
  topic?: string | null;
  level?: string | null;
  phonetic?: string | null;
  example?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
};

export type CommentItem = {
  id: string;
  courseId?: string | null;
  lessonId?: string | null;
  parentCommentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    fullName: string;
  };
};
