import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/api"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { session, error } = await requireAuth()
  if (error) return error

  const { courseId } = await params
  const lessons = await db.lesson.findMany({
    where: { courseId },
    select: { id: true },
  })
  const lessonIds = lessons.map((l) => l.id)

  const completed = await db.progress.findMany({
    where: { userId: session!.user.id, lessonId: { in: lessonIds }, completed: true },
    select: { lessonId: true, completedAt: true },
  })

  const totalLessons = lessonIds.length
  const completedLessons = completed.length
  const percent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100)

  return NextResponse.json({
    courseId,
    totalLessons,
    completedLessons,
    percent,
    completedLessonIds: completed.map((p) => p.lessonId),
  })
}
