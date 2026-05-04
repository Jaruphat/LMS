import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/api"

const schema = z.object({
  lessonId: z.string(),
})

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const result = schema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const progress = await db.progress.upsert({
    where: {
      userId_lessonId: {
        userId: session!.user.id,
        lessonId: result.data.lessonId,
      },
    },
    update: { completed: true, completedAt: new Date() },
    create: {
      userId: session!.user.id,
      lessonId: result.data.lessonId,
      completed: true,
      completedAt: new Date(),
    },
  })

  return NextResponse.json(progress)
}
