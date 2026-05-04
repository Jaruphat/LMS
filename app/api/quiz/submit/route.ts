import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { getCurrentUser, hasCourseAccess } from "@/lib/data"

const submitSchema = z.object({
  quizId: z.string(),
  selectedAnswer: z.string(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()

    const body = await req.json()
    const result = submitSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "ข้อมูลคำตอบไม่ถูกต้อง" }, { status: 400 })
    }

    const { quizId, selectedAnswer } = result.data

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        lesson: {
          select: {
            id: true,
            isPreview: true,
            course: {
              select: {
                id: true,
                price: true,
                status: true,
              },
            },
          },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: "ไม่พบแบบทดสอบ" }, { status: 404 })
    }

    if (user?.role !== "ADMIN") {
      if (quiz.lesson.course.status !== "PUBLISHED") {
        return NextResponse.json({ error: "ไม่พบแบบทดสอบ" }, { status: 404 })
      }

      const canAccess =
        quiz.lesson.isPreview ||
        quiz.lesson.course.price === 0 ||
        (user ? await hasCourseAccess(quiz.lesson.course.id, user.id, user.role) : false)

      if (!canAccess) {
        return NextResponse.json(
          { error: user ? "คุณยังไม่มีสิทธิ์ทำแบบทดสอบนี้" : "กรุณาเข้าสู่ระบบหรือเลือกบทเรียนที่เปิดให้ทดลองก่อน" },
          { status: user ? 403 : 401 }
        )
      }
    }

    const isCorrect = quiz.correctAnswer === selectedAnswer

    const attempt = user
      ? await db.quizAttempt.create({
          data: {
            userId: user.id,
            quizId,
            selectedAnswer,
            isCorrect,
          },
        })
      : null

    return NextResponse.json({
      id: attempt?.id ?? null,
      quizId,
      selectedAnswer,
      isCorrect,
      correctAnswer: quiz.correctAnswer,
      saved: Boolean(user),
    })
  } catch (cause) {
    console.error("Failed to submit quiz", cause)
    return NextResponse.json({ error: "ไม่สามารถส่งคำตอบได้ในขณะนี้" }, { status: 500 })
  }
}
