import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api"
import { canJoinCourseDiscussion } from "@/lib/data"
import { db } from "@/lib/db"

const threadSchema = z.object({
  lessonId: z.string().min(1).nullable().optional(),
  title: z.string().trim().min(3).max(140),
  content: z.string().trim().min(3).max(4000),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params
  const lessonId = req.nextUrl.searchParams.get("lessonId")

  const threads = await db.discussionThread.findMany({
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

  return NextResponse.json({ threads })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { courseId } = await params
    const body = await req.json()
    const parsed = threadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลกระทู้ไม่ถูกต้อง" }, { status: 400 })
    }

    const lessonId = parsed.data.lessonId ?? undefined
    const canPost = await canJoinCourseDiscussion(courseId, lessonId)
    if (!canPost) {
      return NextResponse.json({ error: "คุณยังไม่มีสิทธิ์ตั้งกระทู้ในคอร์สนี้" }, { status: 403 })
    }

    if (lessonId) {
      const lesson = await db.lesson.findFirst({
        where: { id: lessonId, courseId },
        select: { id: true },
      })

      if (!lesson) {
        return NextResponse.json({ error: "ไม่พบบทเรียนที่ต้องการอ้างอิง" }, { status: 404 })
      }
    }

    const thread = await db.discussionThread.create({
      data: {
        courseId,
        lessonId: lessonId ?? null,
        userId: session!.user.id,
        title: parsed.data.title.trim(),
        content: parsed.data.content.trim(),
      },
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

    return NextResponse.json({ thread }, { status: 201 })
  } catch (cause) {
    console.error("Failed to create discussion thread", cause)
    return NextResponse.json({ error: "ไม่สามารถสร้างกระทู้ได้ในขณะนี้" }, { status: 500 })
  }
}
