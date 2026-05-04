import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getCurrentUser, hasCourseAccess } from "@/lib/data"
import { requireRole } from "@/lib/api"

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  contentType: z.enum(["VIDEO", "TEXT"]).optional(),
  content: z.string().min(1).optional(),
  order: z.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params
  const user = await getCurrentUser()
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId },
    include: {
      quizzes: true,
      course: {
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
        },
      },
    },
  })

  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (user?.role !== "ADMIN") {
    if (lesson.course.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const canAccess =
      lesson.isPreview ||
      (user ? await hasCourseAccess(lesson.course.id, user.id, user.role) : lesson.course.price === 0)

    if (!canAccess) {
      return NextResponse.json({ error: user ? "Forbidden" : "Unauthorized" }, { status: user ? 403 : 401 })
    }
  }

  return NextResponse.json(lesson)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { error } = await requireRole("ADMIN")
    if (error) return error

    const body = await req.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "ข้อมูลบทเรียนไม่ถูกต้อง" }, { status: 400 })
    }

    const { lessonId } = await params
    const lesson = await db.lesson.update({
      where: { id: lessonId },
      data: result.data,
    })

    return NextResponse.json(lesson)
  } catch (cause) {
    console.error("Failed to update lesson", cause)
    return NextResponse.json({ error: "ไม่สามารถบันทึกบทเรียนได้ในขณะนี้" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { error } = await requireRole("ADMIN")
    if (error) return error

    const { lessonId } = await params
    await db.lesson.delete({ where: { id: lessonId } })
    return NextResponse.json({ ok: true })
  } catch (cause) {
    console.error("Failed to delete lesson", cause)
    return NextResponse.json({ error: "ไม่สามารถลบบทเรียนได้ในขณะนี้" }, { status: 500 })
  }
}
