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
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Order has already been reviewed." }, { status: 400 })
  }

  const updated = await db.order.update({
    where: { id: orderId },
    data: {
      status: "REJECTED",
      reviewedAt: new Date(),
      reviewedById: session!.user.id,
    },
  })

  return NextResponse.json(updated)
}
