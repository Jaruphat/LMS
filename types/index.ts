export type Role = "STUDENT" | "ADMIN"
export type ContentType = "VIDEO" | "TEXT"
export type CourseStatus = "DRAFT" | "PUBLISHED"
export type OrderStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface User {
  id: string
  name?: string | null
  email: string
  role: Role
  createdAt: Date
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string | null
  price: number
  status: CourseStatus
  viewCount: number
  createdBy: string
  createdAt: Date
  ratingAverage?: number
  ratingCount?: number
  lessons?: Lesson[]
  creator?: Pick<User, "id" | "email">
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  contentType: ContentType
  content: string
  summary?: string | null
  durationText?: string | null
  order: number
  isPreview: boolean
  viewCount: number
  quizzes?: Quiz[]
}

export interface Order {
  id: string
  userId: string
  totalAmount: number
  status: OrderStatus
  slipUrl?: string | null
  slipUploadedAt?: Date | null
  reviewedAt?: Date | null
  reviewedById?: string | null
  createdAt: Date
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  courseId: string
  price: number
  course?: Course
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  orderId?: string | null
  enrolledAt: Date
  course?: Course
}

export interface CourseReview {
  id: string
  courseId: string
  userId: string
  rating: number
  review?: string | null
  createdAt: Date
  updatedAt: Date
  user?: Pick<User, "id" | "email" | "name">
}

export interface DiscussionThread {
  id: string
  courseId: string
  lessonId?: string | null
  userId: string
  title: string
  content: string
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
  user?: Pick<User, "id" | "email" | "name">
  replies?: DiscussionReply[]
}

export interface DiscussionReply {
  id: string
  threadId: string
  userId: string
  content: string
  createdAt: Date
  updatedAt: Date
  user?: Pick<User, "id" | "email" | "name">
}

export interface CourseChatMessage {
  id: string
  courseId: string
  userId?: string | null
  prompt: string
  response: string
  createdAt: Date
}

export interface Quiz {
  id: string
  lessonId: string
  question: string
  choices: string[]
  correctAnswer: string
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  selectedAnswer: string
  isCorrect: boolean
}

export interface Progress {
  id: string
  userId: string
  lessonId: string
  completed: boolean
  completedAt: Date | null
}

// ─── API response shapes ───────────────────

export interface CourseProgress {
  courseId: string
  totalLessons: number
  completedLessons: number
  percent: number
}

// ─── NextAuth session extension ───────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: Role
      name?: string | null
    }
  }
  interface User {
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}
