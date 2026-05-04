import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions, resolveSessionUser } from "@/lib/auth"
import { db } from "@/lib/db"

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions)
  return resolveSessionUser(session?.user)
})

export async function getPublicCourses() {
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { email: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  })
}

export async function getAdminCourses() {
  return db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { email: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  })
}

export async function getCourse(id: string) {
  const user = await getCurrentUser()

  return db.course.findFirst({
    where: user?.role === "ADMIN" ? { id } : { id, status: "PUBLISHED" },
    include: {
      lessons: { orderBy: { order: "asc" } },
      creator: { select: { email: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  })
}

export async function getAdminCourse(id: string) {
  const user = await getCurrentUser()
  if (user?.role !== "ADMIN") return null

  return db.course.findFirst({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { quizzes: true } },
        },
      },
      creator: { select: { email: true } },
      _count: { select: { enrollments: true } },
    },
  })
}

export async function getCourseAccessState(courseId: string) {
  const [user, course] = await Promise.all([
    getCurrentUser(),
    db.course.findFirst({
      where: { id: courseId },
      select: {
        id: true,
        price: true,
        status: true,
      },
    }),
  ])

  if (!course) return null

  if (user?.role === "ADMIN") {
    return {
      user,
      isEnrolled: true,
      hasPendingOrder: false,
      hasFullAccess: true,
    }
  }

  if (!user) {
    return {
      user: null,
      isEnrolled: false,
      hasPendingOrder: false,
      hasFullAccess: course.status === "PUBLISHED" && course.price === 0,
    }
  }

  const [enrollment, pendingOrder] = await Promise.all([
    db.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId } },
    }),
    db.order.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
        items: {
          some: { courseId },
        },
      },
      select: { id: true },
    }),
  ])

  const isEnrolled = Boolean(enrollment)
  const hasFullAccess = course.status === "PUBLISHED" && (course.price === 0 || isEnrolled)

  return {
    user,
    isEnrolled,
    hasPendingOrder: Boolean(pendingOrder),
    hasFullAccess,
  }
}

export async function hasCourseAccess(courseId: string, userId: string, role?: string) {
  if (role === "ADMIN") return true

  const course = await db.course.findFirst({
    where: { id: courseId },
    select: { status: true, price: true },
  })

  if (!course || course.status !== "PUBLISHED") return false
  if (course.price === 0) return true

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })

  return Boolean(enrollment)
}

export async function getLessonForViewer(courseId: string, lessonId: string) {
  const [user, lesson] = await Promise.all([
    getCurrentUser(),
    db.lesson.findFirst({
      where: { id: lessonId, courseId },
      include: {
        quizzes: true,
        course: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
          },
        },
      },
    }),
  ])

  if (!lesson) return null

  if (user?.role === "ADMIN") return lesson
  if (lesson.course.status !== "PUBLISHED") return null
  if (lesson.isPreview || lesson.course.price === 0) return lesson
  if (!user) return null

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
  })

  return enrollment ? lesson : null
}

export async function getCourseProgress(courseId: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const lessons = await db.lesson.findMany({
    where: { courseId },
    select: { id: true },
  })
  const lessonIds = lessons.map((lesson) => lesson.id)

  const completed = await db.progress.findMany({
    where: { userId: user.id, lessonId: { in: lessonIds }, completed: true },
    select: { lessonId: true },
  })

  return {
    total: lessonIds.length,
    completedIds: new Set(completed.map((progress) => progress.lessonId)),
    percent: lessonIds.length === 0 ? 0 : Math.round((completed.length / lessonIds.length) * 100),
  }
}

export async function getLessonProgress(lessonId: string) {
  const user = await getCurrentUser()
  if (!user) return false

  const progress = await db.progress.findFirst({
    where: { userId: user.id, lessonId },
  })

  return progress?.completed ?? false
}

export async function getStudentDashboardData(userId: string) {
  const [enrollments, recentOrders] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          include: {
            _count: { select: { lessons: true } },
          },
        },
      },
    }),
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        items: {
          include: {
            course: {
              select: { id: true, title: true, thumbnailUrl: true },
            },
          },
        },
      },
    }),
  ])

  return { enrollments, recentOrders }
}

export async function getAdminDashboardData() {
  const [courseCount, userCount, pendingOrders, approvedOrders, recentOrders] = await Promise.all([
    db.course.count(),
    db.user.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.findMany({
      where: { status: "APPROVED" },
      select: { totalAmount: true },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { email: true } },
        items: {
          include: {
            course: {
              select: { title: true },
            },
          },
        },
      },
    }),
  ])

  const revenue = approvedOrders.reduce((sum, order) => sum + order.totalAmount, 0)

  return {
    stats: {
      courseCount,
      userCount,
      pendingOrders,
      revenue,
    },
    recentOrders,
  }
}
