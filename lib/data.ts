import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions, resolveSessionUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { averageRatingFromEntries } from "@/lib/engagement"

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions)
  return resolveSessionUser(session?.user)
})

function withCourseStats<T extends { reviews: Array<{ rating: number }> }>(course: T) {
  return {
    ...course,
    ratingAverage: averageRatingFromEntries(course.reviews),
    ratingCount: course.reviews.length,
  }
}

const bangkokDayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Bangkok",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

const bangkokDayLabelFormatter = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  day: "numeric",
  month: "short",
})

function getBangkokDayKey(value: Date) {
  return bangkokDayKeyFormatter.format(value)
}

export async function getPublicCourses() {
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { email: true } },
      reviews: { select: { rating: true } },
      _count: { select: { lessons: true, enrollments: true, reviews: true } },
    },
  })

  return courses.map(withCourseStats)
}

export async function getAdminCourses() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { email: true } },
      reviews: { select: { rating: true } },
      _count: { select: { lessons: true, enrollments: true, reviews: true } },
    },
  })

  return courses.map(withCourseStats)
}

export async function getCourse(id: string) {
  const user = await getCurrentUser()

  const course = await db.course.findFirst({
    where: user?.role === "ADMIN" ? { id } : { id, status: "PUBLISHED" },
    include: {
      lessons: { orderBy: { order: "asc" } },
      creator: { select: { email: true } },
      reviews: { select: { rating: true } },
      _count: { select: { lessons: true, enrollments: true, reviews: true } },
    },
  })

  return course ? withCourseStats(course) : null
}

export async function getAdminCourse(id: string) {
  const user = await getCurrentUser()
  if (user?.role !== "ADMIN") return null

  const course = await db.course.findFirst({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: "asc" },
        include: {
          _count: { select: { quizzes: true } },
        },
      },
      creator: { select: { email: true } },
      reviews: { select: { rating: true } },
      _count: { select: { enrollments: true, reviews: true } },
    },
  })

  return course ? withCourseStats(course) : null
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
  const now = new Date()
  const timelineStart = new Date(now)
  timelineStart.setDate(now.getDate() - 6)
  timelineStart.setHours(0, 0, 0, 0)

  const [courseCount, userCount, totalEnrollments, pendingOrders, approvedOrdersCount, rejectedOrdersCount, analyticsCourses, recentOrders, timelineOrders, totalLessons, videoLessons, previewLessons] =
    await Promise.all([
      db.course.count(),
      db.user.count(),
      db.enrollment.count(),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count({ where: { status: "APPROVED" } }),
      db.order.count({ where: { status: "REJECTED" } }),
      db.course.findMany({
        select: {
          id: true,
          title: true,
          price: true,
          status: true,
          viewCount: true,
          lessons: {
            select: {
              id: true,
              title: true,
              contentType: true,
              isPreview: true,
            },
          },
          reviews: { select: { rating: true } },
          _count: { select: { enrollments: true } },
          orderItems: {
            select: {
              price: true,
              order: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
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
      db.order.findMany({
        where: {
          createdAt: {
            gte: timelineStart,
          },
        },
        orderBy: { createdAt: "asc" },
        select: {
          createdAt: true,
          status: true,
          totalAmount: true,
        },
      }),
      db.lesson.count(),
      db.lesson.count({ where: { contentType: "VIDEO" } }),
      db.lesson.count({ where: { isPreview: true } }),
    ])

  const textLessons = totalLessons - videoLessons
  const publishedCourses = analyticsCourses.filter((course) => course.status === "PUBLISHED").length
  const draftCourses = courseCount - publishedCourses
  const freeCourses = analyticsCourses.filter((course) => course.price === 0).length
  const paidCourses = courseCount - freeCourses
  const totalOrders = pendingOrders + approvedOrdersCount + rejectedOrdersCount
  const totalViews = analyticsCourses.reduce((sum, course) => sum + course.viewCount, 0)

  const topCourses = analyticsCourses
    .map((course) => {
      const approvedRevenue = course.orderItems.reduce((sum, item) => {
        return item.order.status === "APPROVED" ? sum + item.price : sum
      }, 0)

      const previewCount = course.lessons.filter((lesson) => lesson.isPreview).length
      const videoCount = course.lessons.filter((lesson) => lesson.contentType === "VIDEO").length

      return {
        id: course.id,
        title: course.title,
        status: course.status,
        viewCount: course.viewCount,
        revenue: approvedRevenue,
        enrollmentCount: course._count.enrollments,
        lessonCount: course.lessons.length,
        previewCount,
        videoCount,
        ratingAverage: averageRatingFromEntries(course.reviews),
        ratingCount: course.reviews.length,
      }
    })
    .sort((left, right) => {
      if (right.revenue !== left.revenue) return right.revenue - left.revenue
      if (right.enrollmentCount !== left.enrollmentCount) return right.enrollmentCount - left.enrollmentCount
      return right.viewCount - left.viewCount
    })

  const revenue = topCourses.reduce((sum, course) => sum + course.revenue, 0)
  const approvalRate = totalOrders === 0 ? 0 : Math.round((approvedOrdersCount / totalOrders) * 100)
  const averageOrderValue = approvedOrdersCount === 0 ? 0 : revenue / approvedOrdersCount
  const enrollmentRate = totalViews === 0 ? 0 : Math.round((totalEnrollments / totalViews) * 100)

  const revenueTimeline = Array.from({ length: 7 }, (_, index) => {
    const bucketDate = new Date(timelineStart)
    bucketDate.setDate(timelineStart.getDate() + index)

    return {
      key: getBangkokDayKey(bucketDate),
      label: bangkokDayLabelFormatter.format(bucketDate),
      orders: 0,
      approvedOrders: 0,
      revenue: 0,
    }
  })

  const timelineMap = new Map(revenueTimeline.map((bucket) => [bucket.key, bucket]))
  for (const order of timelineOrders) {
    const bucket = timelineMap.get(getBangkokDayKey(order.createdAt))
    if (!bucket) continue

    bucket.orders += 1
    if (order.status === "APPROVED") {
      bucket.approvedOrders += 1
      bucket.revenue += order.totalAmount
    }
  }

  return {
    stats: {
      courseCount,
      userCount,
      pendingOrders,
      approvedOrders: approvedOrdersCount,
      rejectedOrders: rejectedOrdersCount,
      revenue,
      totalLessons,
      totalEnrollments,
      totalViews,
      publishedCourses,
      draftCourses,
      freeCourses,
      paidCourses,
      approvalRate,
      averageOrderValue,
      enrollmentRate,
    },
    orderBreakdown: [
      { status: "PENDING" as const, label: "รออนุมัติ", count: pendingOrders },
      { status: "APPROVED" as const, label: "อนุมัติแล้ว", count: approvedOrdersCount },
      { status: "REJECTED" as const, label: "ปฏิเสธ", count: rejectedOrdersCount },
    ],
    lessonComposition: {
      total: totalLessons,
      video: videoLessons,
      text: textLessons,
      preview: previewLessons,
    },
    revenueTimeline,
    topCourses: topCourses.slice(0, 5),
    recentOrders,
  }
}

export async function getCourseReviews(courseId: string) {
  return db.courseReview.findMany({
    where: { courseId },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })
}

export async function getCourseDiscussionThreads(courseId: string, lessonId?: string) {
  return db.discussionThread.findMany({
    where: {
      courseId,
      ...(lessonId ? { lessonId } : { lessonId: null }),
    },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      },
    },
  })
}

export async function canReviewCourse(courseId: string) {
  const user = await getCurrentUser()
  if (!user) return false
  if (user.role === "ADMIN") return true

  return hasCourseAccess(courseId, user.id, user.role)
}

export async function canJoinCourseDiscussion(courseId: string, lessonId?: string) {
  const user = await getCurrentUser()
  if (!user) return false
  if (user.role === "ADMIN") return true

  if (lessonId) {
    const lesson = await db.lesson.findFirst({
      where: { id: lessonId, courseId },
      include: {
        course: {
          select: {
            status: true,
            price: true,
          },
        },
      },
    })

    if (!lesson || lesson.course.status !== "PUBLISHED") return false
    if (lesson.isPreview || lesson.course.price === 0) return true
  }

  return hasCourseAccess(courseId, user.id, user.role)
}

export async function getCourseChatbotContext(courseId: string) {
  const user = await getCurrentUser()

  const course = await db.course.findFirst({
    where: user?.role === "ADMIN" ? { id: courseId } : { id: courseId, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          contentType: true,
          content: true,
          summary: true,
          durationText: true,
          isPreview: true,
        },
      },
    },
  })

  if (!course) return null
  if (user?.role === "ADMIN" || course.price === 0) return course
  if (!user) {
    return {
      ...course,
      lessons: course.lessons.map((lesson) =>
        lesson.isPreview
          ? lesson
          : {
              ...lesson,
              summary: null,
              content: lesson.title,
            }
      ),
    }
  }

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  })

  if (enrollment) return course

  return {
    ...course,
    lessons: course.lessons.map((lesson) =>
      lesson.isPreview
        ? lesson
        : {
            ...lesson,
            summary: null,
            content: lesson.title,
      }
    ),
  }
}

export async function getGlobalChatbotContext(activeCourseId?: string) {
  const user = await getCurrentUser()
  const courseWhere = user?.role === "ADMIN" ? {} : { status: "PUBLISHED" as const }

  const [activeCourse, courses] = await Promise.all([
    activeCourseId ? getCourseChatbotContext(activeCourseId) : Promise.resolve(null),
    db.course.findMany({
      where: courseWhere,
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      take: 18,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        status: true,
        viewCount: true,
        lessons: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            title: true,
            summary: true,
            contentType: true,
            durationText: true,
            isPreview: true,
          },
        },
        reviews: { select: { rating: true } },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    }),
  ])

  return {
    activeCourse,
    courses: courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      status: course.status,
      viewCount: course.viewCount,
      lessonCount: course._count.lessons,
      enrollmentCount: course._count.enrollments,
      previewCount: course.lessons.filter((lesson) => lesson.isPreview).length,
      videoCount: course.lessons.filter((lesson) => lesson.contentType === "VIDEO").length,
      ratingAverage: averageRatingFromEntries(course.reviews),
      ratingCount: course.reviews.length,
      lessonTopics: course.lessons.slice(0, 5).map((lesson) => lesson.summary?.trim() || lesson.title),
    })),
  }
}
