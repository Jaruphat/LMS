import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api"

const createSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  contentType: z.enum(["VIDEO", "TEXT"]),
  content: z.string().min(1),
  order: z.number().int().min(0),
  isPreview: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    const { error } = await requireRole("ADMIN")
    if (error) return error

    const body = await req.json()
    const result = createSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "ข้อมูลบทเรียนไม่ถูกต้อง" }, { status: 400 })
    }

    const courseExists = await db.course.findUnique({
      where: { id: result.data.courseId },
    })
    if (!courseExists) {
      return NextResponse.json({ error: "ไม่พบคอร์สที่ต้องการเพิ่มบทเรียน" }, { status: 404 })
    }

    const lesson = await db.lesson.create({ data: result.data })
    return NextResponse.json(lesson, { status: 201 })
  } catch (cause) {
    console.error("Failed to create lesson", cause)
    return NextResponse.json({ error: "ไม่สามารถสร้างบทเรียนได้ในขณะนี้" }, { status: 500 })
  }
}
