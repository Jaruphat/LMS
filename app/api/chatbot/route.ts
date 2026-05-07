import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { answerGlobalAssistantQuestion } from "@/lib/chatbot"
import { getGlobalChatbotContext } from "@/lib/data"

const chatbotSchema = z.object({
  question: z.string().trim().min(2).max(500),
  courseId: z.string().trim().min(1).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = chatbotSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "คำถามสั้นเกินไปหรือรูปแบบไม่ถูกต้อง" }, { status: 400 })
    }

    const context = await getGlobalChatbotContext(parsed.data.courseId)
    if (!context.activeCourse && context.courses.length === 0) {
      return NextResponse.json({ error: "ยังไม่มีข้อมูลคอร์สให้แนะนำในตอนนี้" }, { status: 404 })
    }

    const answer = answerGlobalAssistantQuestion(context, parsed.data.question)
    return NextResponse.json(answer)
  } catch (cause) {
    console.error("Failed to answer global chatbot question", cause)
    return NextResponse.json(
      { error: "ตอนนี้ผู้ช่วยยังตอบคำถามนี้ไม่ได้ ลองใหม่อีกครั้งนะ" },
      { status: 500 }
    )
  }
}
