import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const course = await db.course.update({
      where: { id: courseId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
      select: {
        viewCount: true,
      },
    })

    return NextResponse.json(course)
  } catch (cause) {
    console.error("Failed to track course view", cause)
    return NextResponse.json({ error: "ไม่สามารถบันทึกยอดเข้าชมได้" }, { status: 500 })
  }
}
