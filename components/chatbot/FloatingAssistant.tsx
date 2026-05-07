"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { Bot, Minimize2, SendHorizonal, Sparkles, User2, X } from "lucide-react"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"

type AssistantReference = {
  title: string
  snippet: string
  href?: string
  badge?: string
}

type ChatMessage = {
  role: "assistant" | "user"
  text: string
  references?: AssistantReference[]
}

const ASSISTANT_STATE_KEY = "lms-floating-assistant-open"

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  text: "สวัสดีครับ ผมเป็นผู้ช่วยแนะนำคอร์สของ LearnHub ถามได้ทั้งเรื่องเลือกคอร์ส เนื้อหา preview วิธีสั่งซื้อ และการใช้งานระบบครับ",
}

function getContextLabel(pathname: string, courseId?: string) {
  if (pathname.startsWith("/admin")) return "ตอบคำถามคอร์ส & ภาพรวมระบบ"
  if (courseId) return "กำลังดูคำถามในบริบทคอร์สนี้"
  if (pathname.startsWith("/dashboard")) return "ช่วยแนะนำคอร์สและการใช้งานแดชบอร์ด"
  return "ช่วยเลือกคอร์สและใช้งานระบบ"
}

function getQuickPrompts(pathname: string, courseId?: string) {
  if (courseId) {
    return [
      "คอร์สนี้มีบท preview อะไรบ้าง",
      "คอร์สนี้เหมาะกับใคร",
      "ถ้าจะเริ่มเรียนควรดูบทไหนก่อน",
    ]
  }

  if (pathname.startsWith("/admin")) {
    return [
      "ช่วยแนะนำคอร์สที่น่าผลักดันให้ขายดีหน่อย",
      "มีคอร์สฟรีอะไรบ้าง",
      "ผู้เรียนใหม่ควรเริ่มจากคอร์สไหน",
    ]
  }

  return [
    "แนะนำคอร์สให้หน่อย",
    "มีคอร์สฟรีอะไรบ้าง",
    "วิธีสั่งซื้อคอร์สทำยังไง",
  ]
}

export function FloatingAssistant() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(ASSISTANT_STATE_KEY) === "1"
  })
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const courseId = useMemo(() => {
    const matchedCoursePath = pathname.match(/^\/courses\/([^/]+)/)
    return matchedCoursePath?.[1]
  }, [pathname])

  const quickPrompts = useMemo(() => getQuickPrompts(pathname, courseId), [courseId, pathname])
  const contextLabel = useMemo(() => getContextLabel(pathname, courseId), [courseId, pathname])

  useEffect(() => {
    window.localStorage.setItem(ASSISTANT_STATE_KEY, isOpen ? "1" : "0")
  }, [isOpen])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [loading, messages])

  async function submitQuestion(rawQuestion: string) {
    const trimmedQuestion = rawQuestion.trim()
    if (!trimmedQuestion) return

    setMessages((previous) => [...previous, { role: "user", text: trimmedQuestion }])
    setQuestion("")
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmedQuestion,
          courseId,
        }),
      })

      const result = await readApiPayload(response)
      if (!response.ok) {
        setError(extractApiError(result, "ตอนนี้ผู้ช่วยยังตอบคำถามนี้ไม่ได้"))
        return
      }

      if (result && typeof result === "object" && "answer" in result) {
        const payload = result as { answer: string; references?: AssistantReference[] }
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
      setError("เชื่อมต่อผู้ช่วยไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await submitQuestion(question)
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      {isOpen ? (
        <section className="pointer-events-auto w-[min(94vw,25rem)] overflow-hidden rounded-[2rem] border border-rose-200 bg-[linear-gradient(180deg,rgba(255,253,252,0.98),rgba(255,247,242,0.98))] shadow-[0_30px_90px_-40px_rgba(127,29,29,0.35)] backdrop-blur">
          <header className="border-b border-rose-100 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">AI Course Guide</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950 text-balance">ผู้ช่วยแนะนำคอร์ส</h2>
                  <p className="mt-1 text-xs leading-6 text-slate-500">{contextLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="ย่อผู้ช่วย"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-100 bg-white text-slate-500 transition hover:border-rose-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  style={{ touchAction: "manipulation" }}
                >
                  <Minimize2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 pb-4 pt-4">
            {messages.length <= 1 ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void submitQuestion(prompt)}
                    className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                    style={{ touchAction: "manipulation" }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}

            <div
              ref={scrollRef}
              aria-live="polite"
              className="max-h-[24rem] space-y-3 overflow-y-auto rounded-[1.6rem] bg-white/85 p-3 ring-1 ring-rose-100 [overscroll-behavior:contain]"
            >
              {messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}`}
                  className={`rounded-[1.35rem] px-4 py-3 ${
                    message.role === "assistant"
                      ? "border border-rose-100 bg-[#fff8f5] text-slate-700"
                      : "bg-slate-950 text-white"
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                    {message.role === "assistant" ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
                        <span className="text-rose-700">ผู้ช่วย</span>
                      </>
                    ) : (
                      <>
                        <User2 className="h-3.5 w-3.5 text-white/80" aria-hidden="true" />
                        <span className="text-white/80">คุณ</span>
                      </>
                    )}
                  </div>

                  <p className={`break-words text-sm leading-7 ${message.role === "assistant" ? "text-slate-700" : "text-white"}`}>
                    {message.text}
                  </p>

                  {message.references && message.references.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {message.references.map((reference) => (
                        <div
                          key={`${reference.title}-${reference.href ?? reference.snippet}`}
                          className="rounded-[1.15rem] border border-rose-100 bg-white px-3 py-3"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            {reference.href ? (
                              <Link
                                href={reference.href}
                                className="text-sm font-semibold text-slate-900 transition hover:text-rose-700"
                              >
                                {reference.title}
                              </Link>
                            ) : (
                              <p className="text-sm font-semibold text-slate-900">{reference.title}</p>
                            )}

                            {reference.badge ? (
                              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                                {reference.badge}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 break-words text-sm leading-6 text-slate-600">{reference.snippet}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}

              {loading ? (
                <div className="rounded-[1.35rem] border border-rose-100 bg-[#fff8f5] px-4 py-3 text-sm text-slate-600">
                  กำลังค้นคำตอบ…
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <label htmlFor="floating-assistant-question" className="sr-only">
                คำถามถึงผู้ช่วยแนะนำคอร์ส
              </label>
              <textarea
                id="floating-assistant-question"
                name="assistant_question"
                rows={3}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="ถามเรื่องคอร์สที่เหมาะกับคุณ วิธีสั่งซื้อ หรือเนื้อหา preview ได้เลย…"
                className="w-full resize-none rounded-[1.35rem] border border-rose-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus-visible:border-rose-300 focus-visible:ring-4 focus-visible:ring-rose-100"
                autoComplete="off"
              />

              {error ? (
                <p className="rounded-[1rem] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs leading-6 text-slate-500">ถามได้ทั้งเรื่องเลือกคอร์ส, preview, Q&A และขั้นตอนการสั่งซื้อ</p>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                  style={{ touchAction: "manipulation" }}
                >
                  <SendHorizonal className="h-4 w-4" aria-hidden="true" />
                  ส่งคำถาม
                </button>
              </div>
            </form>
          </div>
        </section>
      ) : null}

      <div className="pointer-events-auto flex items-center gap-3">
        {!isOpen ? (
          <div className="hidden rounded-full border border-rose-200 bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm sm:block">
            มีอะไรให้ช่วยเลือกคอร์สไหม
          </div>
        ) : null}

        <button
          type="button"
          aria-label={isOpen ? "ปิดผู้ช่วย" : "เปิดผู้ช่วย"}
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,#fb7185,#e11d48_68%,#9f1239)] text-white shadow-[0_24px_60px_-30px_rgba(159,18,57,0.55)] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
          style={{ touchAction: "manipulation" }}
        >
          {isOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Bot className="h-7 w-7" aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
