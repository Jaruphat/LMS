import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api"

export async function GET() {
  const { error } = await requireRole("ADMIN")
  if (error) return error

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
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

  return NextResponse.json(orders)
}
