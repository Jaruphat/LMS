import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const { lessonId } = await params
    const lesson = await db.lesson.update({
      where: { id: lessonId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        viewCount: true,
      },
    })

    return NextResponse.json(lesson)
  } catch (cause) {
    console.error("Failed to track lesson view", cause)
    return NextResponse.json({ error: "ไม่สามารถบันทึกยอดเข้าชมบทเรียนได้" }, { status: 500 })
  }
}
