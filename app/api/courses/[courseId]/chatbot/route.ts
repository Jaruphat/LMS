import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { answerCourseQuestion } from "@/lib/chatbot"
import { getCourseChatbotContext, getCurrentUser } from "@/lib/data"
import { db } from "@/lib/db"

const chatbotSchema = z.object({
  question: z.string().trim().min(2).max(500),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params
    const body = await req.json()
    const parsed = chatbotSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "คำถามสั้นเกินไปหรือรูปแบบไม่ถูกต้อง" }, { status: 400 })
    }

    const course = await getCourseChatbotContext(courseId)
    if (!course) {
      return NextResponse.json({ error: "ไม่พบคอร์สที่ต้องการถาม" }, { status: 404 })
    }

    const answer = answerCourseQuestion(course, parsed.data.question)
    const user = await getCurrentUser()

    await db.courseChatMessage.create({
      data: {
        courseId,
        userId: user?.id ?? null,
        prompt: parsed.data.question.trim(),
        response: answer.answer,
      },
    })

    return NextResponse.json(answer)
  } catch (cause) {
    console.error("Failed to answer course chatbot question", cause)
    return NextResponse.json({ error: "ตอนนี้บอทยังตอบคำถามนี้ไม่ได้ ลองใหม่อีกครั้งนะ" }, { status: 500 })
  }
}
