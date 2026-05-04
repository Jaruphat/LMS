import { NextResponse } from "next/server"
import { requireRole } from "@/lib/api"
import { db } from "@/lib/db"

export async function GET() {
  const { session, error } = await requireRole("STUDENT")
  if (error) return error

  const enrollments = await db.enrollment.findMany({
    where: { userId: session!.user.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
  })

  return NextResponse.json(enrollments)
}
