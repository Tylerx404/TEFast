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

export type AdminUserListItem = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole | string;
  status: string;
  createdAt: string;
};

export type AdminUserDetail = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole | string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserRoleUpdateInput = {
  role: UserRole;
};

export type SystemHealth = {
  service: string;
  status: string;
  runtime: string;
  timestamp: string;
  dependencies: {
    postgres: string;
    redis: string;
  };
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
  contentType?: string;
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

export type CourseCreateInput = {
  title: string;
  slug: string;
  description: string;
  category: ExamCategory;
  level: string;
  price: number;
  thumbnailUrl: string;
  isPublished: boolean;
};

export type CourseUpdateInput = Partial<CourseCreateInput>;

export type EnrollmentItem = {
  id: string;
  courseId: string;
  courseSlug?: string | null;
  courseTitle: string;
  progressPercent: number;
  lastLessonId?: string | null;
  lastLessonOrderIndex?: number | null;
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

export type LessonCreateInput = {
  title: string;
  contentType: string;
  content: string;
  attachmentUrl: string;
  orderIndex: number;
  isPreview: boolean;
};

export type LessonUpdateInput = Partial<LessonCreateInput>;

export type LessonOrderUpdateInput = {
  orderIndex: number;
};

export type ExamListItem = {
  id: string;
  courseId?: string | null;
  title: string;
  category: ExamCategory;
  examType: string;
  durationMinutes: number;
  totalQuestions: number;
  isPublished?: boolean;
};

export type ExamDetail = ExamListItem & {
  instructions?: string | null;
  courseId?: string | null;
};

export type ExamCreateInput = {
  courseId: string;
  title: string;
  category: ExamCategory;
  examType: string;
  durationMinutes: number;
  instructions: string;
  isPublished?: boolean;
};

export type ExamUpdateInput = Partial<Omit<ExamCreateInput, "courseId">>;

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

export type QuestionDetail = QuestionItem & {
  correctAnswer?: string | null;
};

export type QuestionCreateInput = {
  section: string;
  content: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
  audioUrl?: string;
  imageUrl?: string;
};

export type QuestionUpdateInput = Partial<QuestionCreateInput>;

export type ExamAnswerPayload = {
  questionId: string;
  selectedAnswer: string;
};

export type ExamResultSummary = {
  id: string;
  publicSlug?: string | null;
  examId: string;
  examTitle?: string;
  score: number;
  submittedAt: string;
};

export type ExamResultDetail = {
  id: string;
  publicSlug?: string | null;
  examId: string;
  examTitle?: string | null;
  userId: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  durationSpentSeconds: number;
  feedback?: string | null;
  reviewedAt?: string | null;
  submittedAt: string;
};

export type CourseEnrollmentItem = {
  id: string;
  user: {
    id: string;
    fullName: string;
  };
  progressPercent: number;
  status: string;
};

export type TeacherExamResultItem = {
  id: string;
  user: {
    id: string;
    fullName: string;
  };
  score: number;
  submittedAt: string;
};

export type ExamResultReviewInput = {
  feedback: string;
  manualScore: number;
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
  isPublished?: boolean;
};

export type VocabularyCreateInput = {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  category: ExamCategory;
  topic: string;
  level: string;
  audioUrl: string;
  imageUrl: string;
  isPublished?: boolean;
};

export type VocabularyUpdateInput = Partial<VocabularyCreateInput>;

export type UploadFileItem = {
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
};

export type CommentItem = {
  id: string;
  courseTitle?: string | null;
  courseId?: string | null;
  lessonId?: string | null;
  parentCommentId?: string | null;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id?: string;
    fullName: string;
  };
};
