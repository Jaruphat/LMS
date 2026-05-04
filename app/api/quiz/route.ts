import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireRole } from "@/lib/api"

const createSchema = z.object({
  lessonId: z.string(),
  question: z.string().min(1),
  choices: z.array(z.string()).min(2).max(6),
  correctAnswer: z.string(),
})

export async function POST(req: NextRequest) {
  const { error } = await requireRole("ADMIN")
  if (error) return error

  const body = await req.json()
  const result = createSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  if (!result.data.choices.includes(result.data.correctAnswer)) {
    return NextResponse.json(
      { error: "correctAnswer must be one of the choices" },
      { status: 400 }
    )
  }

  const quiz = await db.quiz.create({ data: result.data })
  return NextResponse.json(quiz, { status: 201 })
}
