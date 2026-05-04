import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api"
import { saveSlipFile } from "@/lib/uploads"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { session, error } = await requireRole("STUDENT")
  if (error) return error

  const { orderId } = await params
  const order = await db.order.findFirst({
    where: { id: orderId, userId: session!.user.id },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending orders can upload a slip." }, { status: 400 })
  }

  const formData = await req.formData()
  const slip = formData.get("slip")

  if (!(slip instanceof File)) {
    return NextResponse.json({ error: "Slip file is required." }, { status: 400 })
  }

  try {
    const slipUrl = await saveSlipFile(slip, { orderId })
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        slipUrl,
        slipUploadedAt: new Date(),
      },
    })

    return NextResponse.json(updatedOrder)
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Unable to upload slip."
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
