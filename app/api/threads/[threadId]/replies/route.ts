import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { requireAuth } from "@/lib/api"
import { canJoinCourseDiscussion } from "@/lib/data"
import { db } from "@/lib/db"

const replySchema = z.object({
  content: z.string().trim().min(1).max(3000),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { session, error } = await requireAuth()
    if (error) return error

    const { threadId } = await params
    const body = await req.json()
    const parsed = replySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "ข้อมูลคำตอบไม่ถูกต้อง" }, { status: 400 })
    }

    const thread = await db.discussionThread.findUnique({
      where: { id: threadId },
      select: {
        id: true,
        courseId: true,
        lessonId: true,
      },
    })

    if (!thread) {
      return NextResponse.json({ error: "ไม่พบกระทู้ที่ต้องการตอบ" }, { status: 404 })
    }

    const canReply = await canJoinCourseDiscussion(thread.courseId, thread.lessonId ?? undefined)
    if (!canReply) {
      return NextResponse.json({ error: "คุณยังไม่มีสิทธิ์ตอบในกระทู้นี้" }, { status: 403 })
    }

    const reply = await db.discussionReply.create({
      data: {
        threadId,
        userId: session!.user.id,
        content: parsed.data.content.trim(),
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

    await db.discussionThread.update({
      where: { id: threadId },
      data: {
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ reply }, { status: 201 })
  } catch (cause) {
    console.error("Failed to create discussion reply", cause)
    return NextResponse.json({ error: "ไม่สามารถตอบกระทู้ได้ในขณะนี้" }, { status: 500 })
  }
}
