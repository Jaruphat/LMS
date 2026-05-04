import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api"

const thumbnailUrlSchema = z.union([z.string().url(), z.string().startsWith("/")])

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0).default(0),
  thumbnailUrl: thumbnailUrlSchema.nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
})

export async function GET() {
  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { id: true, email: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  })
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireRole("ADMIN")
    if (error) return error

    const body = await req.json()
    const result = createSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "ข้อมูลคอร์สไม่ถูกต้อง" }, { status: 400 })
    }

    const course = await db.course.create({
      data: {
        ...result.data,
        thumbnailUrl: result.data.thumbnailUrl ?? null,
        createdBy: session!.user.id,
      },
    })
    return NextResponse.json(course, { status: 201 })
  } catch (cause) {
    console.error("Failed to create course", cause)
    return NextResponse.json({ error: "ไม่สามารถสร้างคอร์สได้ในขณะนี้" }, { status: 500 })
  }
}
