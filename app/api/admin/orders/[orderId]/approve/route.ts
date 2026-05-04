import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { session, error } = await requireRole("ADMIN")
  if (error) return error

  const { orderId } = await params
  const order = await db.order.findFirst({
    where: { id: orderId },
    include: {
      items: true,
    },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Order has already been reviewed." }, { status: 400 })
  }

  if (order.totalAmount > 0 && !order.slipUrl) {
    return NextResponse.json({ error: "Cannot approve an order without a slip upload." }, { status: 400 })
  }

  const now = new Date()

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "APPROVED",
        reviewedAt: now,
        reviewedById: session!.user.id,
      },
    })

    await tx.enrollment.createMany({
      data: order.items.map((item) => ({
        userId: order.userId,
        courseId: item.courseId,
        orderId: order.id,
        enrolledAt: now,
      })),
      skipDuplicates: true,
    })
  })

  const updated = await db.order.findFirst({
    where: { id: orderId },
    include: {
      user: { select: { id: true, email: true } },
      items: {
        include: {
          course: {
            select: { id: true, title: true, thumbnailUrl: true },
          },
        },
      },
    },
  })

  return NextResponse.json(updated)
}
