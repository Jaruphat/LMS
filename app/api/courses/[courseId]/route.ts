import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api"

const thumbnailUrlSchema = z.union([z.string().url(), z.string().startsWith("/")])

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().min(0).optional(),
  thumbnailUrl: thumbnailUrlSchema.nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await getServerSession(authOptions)

  const { courseId } = await params
  const course = await db.course.findFirst({
    where: session?.user?.role === "ADMIN" ? { id: courseId } : { id: courseId, status: "PUBLISHED" },
    include: {
      lessons: { orderBy: { order: "asc" } },
      creator: { select: { id: true, email: true } },
      _count: { select: { lessons: true, enrollments: true } },
    },
  })

  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(course)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { error } = await requireRole("ADMIN")
    if (error) return error

    const body = await req.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "ข้อมูลคอร์สไม่ถูกต้อง" }, { status: 400 })
    }

    const { courseId } = await params
    const course = await db.course.update({
      where: { id: courseId },
      data: result.data,
    })

    return NextResponse.json(course)
  } catch (cause) {
    console.error("Failed to update course", cause)
    return NextResponse.json({ error: "ไม่สามารถบันทึกคอร์สได้ในขณะนี้" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { error } = await requireRole("ADMIN")
    if (error) return error

    const { courseId } = await params
    await db.course.delete({ where: { id: courseId } })
    return NextResponse.json({ ok: true })
  } catch (cause) {
    if (
      cause instanceof Prisma.PrismaClientKnownRequestError &&
      (cause.code === "P2003" || cause.code === "P2014")
    ) {
      return NextResponse.json(
        { error: "This course already has orders or enrollments and cannot be deleted." },
        { status: 400 }
      )
    }

    console.error("Failed to delete course", cause)
    return NextResponse.json({ error: "ไม่สามารถลบคอร์สได้ในขณะนี้" }, { status: 500 })
  }
}
