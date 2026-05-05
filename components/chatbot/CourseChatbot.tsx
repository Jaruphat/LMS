"use client"

import Link from "next/link"
import { useState } from "react"
import { Bot, Sparkles, User2 } from "lucide-react"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"

type ChatReference = {
  title: string
  snippet: string
  lessonId?: string
}

type ChatEntry = {
  role: "user" | "assistant"
  text: string
  references?: ChatReference[]
}

type Props = {
  courseId: string
  courseTitle: string
}

export function CourseChatbot({ courseId, courseTitle }: Props) {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: "assistant",
      text: `สวัสดี ผมช่วยสรุปสารบัญและเนื้อหาเบื้องต้นของคอร์ส ${courseTitle} ให้ได้ ลองถามเรื่องหัวข้อเรียน, บท preview, ราคา หรือบทไหนควรเริ่มก่อนก็ได้`,
    },
  ])
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) return

    setMessages((previous) => [...previous, { role: "user", text: trimmed }])
    setQuestion("")
    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/courses/${courseId}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      })

      const result = await readApiPayload(response)
      if (!response.ok) {
        setError(extractApiError(result, "บอทยังตอบคำถามนี้ไม่ได้ในตอนนี้"))
        return
      }

      if (result && typeof result === "object" && "answer" in result) {
        const payload = result as { answer: string; references?: ChatReference[] }
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            text: payload.answer,
            references: payload.references ?? [],
          },
        ])
      }
    } catch {
      setError("เชื่อมต่อบอทไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="course-chatbot">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Chatbot</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">ผู้ช่วยสรุปเนื้อหาคอร์ส</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            ใช้ถามทางลัดเกี่ยวกับบทเรียน preview, หัวข้อที่มีอยู่ในคอร์ส, หรือให้ช่วยชี้ว่าควรเริ่มดูบทไหนก่อน
          </p>
        </div>
      </div>

      <div className="mb-4 space-y-3 rounded-3xl bg-slate-50 p-4">
        {messages.map((entry, index) => (
          <div
            key={`${entry.role}-${index}`}
            className={`rounded-3xl px-4 py-3 ${
              entry.role === "assistant" ? "bg-white border border-slate-200" : "bg-slate-950 text-white"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]">
              {entry.role === "assistant" ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                  <span className="text-cyan-700">Course Assistant</span>
                </>
              ) : (
                <>
                  <User2 className="h-3.5 w-3.5" />
                  <span className="text-white/80">You</span>
                </>
              )}
            </div>

            <p className={`text-sm leading-7 ${entry.role === "assistant" ? "text-slate-700" : "text-white"}`}>{entry.text}</p>

            {entry.references && entry.references.length > 0 && (
              <div className="mt-3 space-y-2">
                {entry.references.map((reference) => (
                  <div key={`${reference.title}-${reference.lessonId ?? "course"}`} className="rounded-2xl bg-slate-50 px-3 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {reference.lessonId ? (
                        <Link href={`/courses/${courseId}/lessons/${reference.lessonId}`} className="hover:text-cyan-700">
                          {reference.title}
                        </Link>
                      ) : (
                        reference.title
                      )}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{reference.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          data-testid="chatbot-question-input"
          rows={3}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="ตัวอย่าง: คอร์สนี้มีบท preview อะไรบ้าง หรือควรเริ่มจากบทไหนก่อน"
          className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            data-testid="chatbot-submit"
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
          >
            {loading ? "กำลังค้นคำตอบ..." : "ถามบอท"}
          </button>
        </div>
      </form>
    </section>
  )
}
