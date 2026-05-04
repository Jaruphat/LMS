import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api"

const createOrderSchema = z.object({
  courseIds: z.array(z.string()).min(1),
})

export async function GET() {
  const { session, error } = await requireRole("STUDENT")
  if (error) return error

  const orders = await db.order.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          course: {
            select: { id: true, title: true, thumbnailUrl: true },
          },
        },
      },
    },
  })

  return NextResponse.json(orders)
}

export async function POST(req: NextRequest) {
  try {
    const { session, error } = await requireRole("STUDENT")
    if (error) return error

    const body = await req.json()
    const result = createOrderSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "ข้อมูลคำสั่งซื้อไม่ถูกต้อง" }, { status: 400 })
    }

    const userId = session!.user.id
    const courseIds = [...new Set(result.data.courseIds)]

    const [courses, enrollments] = await Promise.all([
      db.course.findMany({
        where: {
          id: { in: courseIds },
          status: "PUBLISHED",
        },
        select: {
          id: true,
          title: true,
          price: true,
        },
      }),
      db.enrollment.findMany({
        where: {
          userId,
          courseId: { in: courseIds },
        },
        select: { courseId: true },
      }),
    ])

    if (courses.length !== courseIds.length) {
      return NextResponse.json({ error: "มีบางคอร์สไม่พร้อมให้สั่งซื้อในขณะนี้" }, { status: 400 })
    }

    const enrolledIds = new Set(enrollments.map((enrollment) => enrollment.courseId))
    const purchasableCourses = courses.filter((course) => !enrolledIds.has(course.id))

    if (purchasableCourses.length === 0) {
      return NextResponse.json({ error: "คุณมีสิทธิ์ในคอร์สที่เลือกทั้งหมดอยู่แล้ว" }, { status: 400 })
    }

    const totalAmount = purchasableCourses.reduce((sum, course) => sum + course.price, 0)
    const autoApprove = totalAmount === 0
    const now = new Date()

    const order = await db.order.create({
      data: {
        userId,
        totalAmount,
        status: autoApprove ? "APPROVED" : "PENDING",
        reviewedAt: autoApprove ? now : null,
        items: {
          create: purchasableCourses.map((course) => ({
            courseId: course.id,
            price: course.price,
          })),
        },
        enrollments: autoApprove
          ? {
              create: purchasableCourses.map((course) => ({
                userId,
                courseId: course.id,
                enrolledAt: now,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            course: {
              select: { id: true, title: true, thumbnailUrl: true },
            },
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (cause) {
    console.error("Failed to create order", cause)
    return NextResponse.json({ error: "ไม่สามารถสร้างคำสั่งซื้อได้ในขณะนี้" }, { status: 500 })
  }
}
