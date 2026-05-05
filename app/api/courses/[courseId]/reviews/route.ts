import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api"
import { db } from "@/lib/db"
import { averageRatingFromEntries, clampRating } from "@/lib/engagement"
import { canReviewCourse } from "@/lib/data"

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(1500).nullable().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params

  const [course, reviews] = await Promise.all([
    db.course.findFirst({
      where: { id: courseId, status: "PUBLISHED" },
      select: { id: true },
    }),
    db.courseReview.findMany({
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
    }),
  ])

  if (!course) {
    return NextResponse.json({ error: "ไม่พบคอร์สที่ต้องการดูรีวิว" }, { status: 404 })
  }

  return NextResponse.json({
    reviews,
    summary: {
      ratingAverage: averageRatingFromEntries(reviews),
      ratingCount: reviews.length,
    },
  })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { courseId } = await params
    const canReview = await canReviewCourse(courseId)
    if (!canReview) {
      return NextResponse.json({ error: "ต้องมีสิทธิ์เข้าเรียนก่อนจึงจะรีวิวคอร์สนี้ได้" }, { status: 403 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลรีวิวไม่ถูกต้อง" }, { status: 400 })
    }

    const course = await db.course.findFirst({
      where: { id: courseId, status: "PUBLISHED" },
      select: { id: true },
    })

    if (!course) {
      return NextResponse.json({ error: "ไม่พบคอร์สที่ต้องการรีวิว" }, { status: 404 })
    }

    const review = await db.courseReview.upsert({
      where: {
        courseId_userId: {
          courseId,
          userId: session!.user.id,
        },
      },
      update: {
        rating: clampRating(parsed.data.rating),
        review: parsed.data.review?.trim() || null,
      },
      create: {
        courseId,
        userId: session!.user.id,
        rating: clampRating(parsed.data.rating),
        review: parsed.data.review?.trim() || null,
      },
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

    const summaryEntries = await db.courseReview.findMany({
      where: { courseId },
      select: { rating: true },
    })

    return NextResponse.json({
      review,
      summary: {
        ratingAverage: averageRatingFromEntries(summaryEntries),
        ratingCount: summaryEntries.length,
      },
    })
  } catch (cause) {
    console.error("Failed to save course review", cause)
    return NextResponse.json({ error: "ไม่สามารถบันทึกรีวิวได้ในขณะนี้" }, { status: 500 })
  }
}
