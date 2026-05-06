"use client"

import { useState } from "react"
import { CircleHelp, MessageSquareText, Pin, Send, Shield } from "lucide-react"
import { formatDateTime } from "@/lib/format"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"
import type { DiscussionReply, DiscussionThread, Role } from "@/types"

type ThreadUser = {
  id: string
  email: string
  name?: string | null
  role?: Role
}

type ThreadWithRelations = DiscussionThread & {
  user?: ThreadUser
  replies?: Array<DiscussionReply & { user?: ThreadUser }>
}

type Props = {
  courseId: string
  lessonId?: string
  title: string
  description: string
  canPost: boolean
  initialThreads: ThreadWithRelations[]
}

function getDisplayName(user?: ThreadUser) {
  return user?.name || user?.email || "ผู้เรียน"
}

function isInstructor(role?: Role) {
  return role === "ADMIN"
}

export function DiscussionBoard({ courseId, lessonId, title, description, canPost, initialThreads }: Props) {
  const [threads, setThreads] = useState(initialThreads)
  const [threadTitle, setThreadTitle] = useState("")
  const [threadContent, setThreadContent] = useState("")
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [submittingThread, setSubmittingThread] = useState(false)
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null)
  const [error, setError] = useState("")

  const totalReplies = threads.reduce((sum, thread) => sum + (thread.replies?.length ?? 0), 0)
  const answeredThreads = threads.filter((thread) => thread.replies?.some((reply) => isInstructor(reply.user?.role))).length

  async function handleCreateThread(event: React.FormEvent) {
    event.preventDefault()
    setSubmittingThread(true)
    setError("")

    try {
      const response = await fetch(`/api/courses/${courseId}/threads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: lessonId ?? null,
          title: threadTitle,
          content: threadContent,
        }),
      })

      const result = await readApiPayload(response)
      if (!response.ok) {
        setError(extractApiError(result, "ยังสร้างคำถามใหม่ไม่ได้ในขณะนี้"))
        return
      }

      if (result && typeof result === "object" && "thread" in result && result.thread) {
        const payload = result as { thread: ThreadWithRelations }
        setThreads((previous) => [payload.thread, ...previous])
        setThreadTitle("")
        setThreadContent("")
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setSubmittingThread(false)
    }
  }

  async function handleReply(threadId: string) {
    const content = replyDrafts[threadId]?.trim()
    if (!content) return

    setSubmittingReplyId(threadId)
    setError("")

    try {
      const response = await fetch(`/api/threads/${threadId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      const result = await readApiPayload(response)
      if (!response.ok) {
        setError(extractApiError(result, "ยังตอบคำถามนี้ไม่ได้ในขณะนี้"))
        return
      }

      if (result && typeof result === "object" && "reply" in result && result.reply) {
        const payload = result as {
          reply: DiscussionReply & { user?: ThreadUser }
        }

        setThreads((previous) =>
          previous.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  replies: [...(thread.replies ?? []), payload.reply],
                  updatedAt: new Date().toISOString() as never,
                }
              : thread
          )
        )
        setReplyDrafts((previous) => ({ ...previous, [threadId]: "" }))
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setSubmittingReplyId(null)
    }
  }

  return (
    <section
      className="rounded-[32px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_100%)] p-6 shadow-[0_24px_70px_-50px_rgba(159,18,57,0.45)]"
      data-testid="discussion-board"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
            <MessageSquareText className="h-3.5 w-3.5" />
            Q&A Webboard
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        </div>

        <div className="grid min-w-[240px] gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-rose-100 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">คำถามทั้งหมด</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{threads.length}</p>
            <p className="mt-1 text-xs text-slate-500">รวมทุกกระทู้ในส่วนนี้</p>
          </div>
          <div className="rounded-3xl border border-rose-100 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">คำตอบจากระบบ</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{answeredThreads}</p>
            <p className="mt-1 text-xs text-slate-500">{totalReplies} ข้อความตอบกลับ</p>
          </div>
        </div>
      </div>

      {canPost ? (
        <form onSubmit={handleCreateThread} className="mb-6 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
              <CircleHelp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">ตั้งคำถามถึงผู้สอนและเพื่อนร่วมคลาส</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                ยิ่งเขียนบริบท สิ่งที่ลองทำ และจุดที่ติดไว้ชัด คำตอบก็จะยิ่งช่วยแก้ปัญหาได้เร็วขึ้น
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              data-testid="thread-title-input"
              type="text"
              value={threadTitle}
              onChange={(event) => setThreadTitle(event.target.value)}
              placeholder="สรุปคำถามสั้น ๆ เช่น ทำไม workflow นี้ไม่ยิง webhook ต่อ"
              className="w-full rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:bg-white"
            />
            <textarea
              data-testid="thread-content-input"
              rows={4}
              value={threadContent}
              onChange={(event) => setThreadContent(event.target.value)}
              placeholder="เล่าปัญหา สิ่งที่ทำไปแล้ว หรือแนบรายละเอียดของบทเรียนที่กำลังดูอยู่"
              className="w-full resize-none rounded-2xl border border-rose-100 bg-rose-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:bg-white"
            />
          </div>

          {error && <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="text-xs leading-6 text-slate-500">โพสต์แล้วสามารถกลับมาตอบต่อหรืออัปเดตบริบทเพิ่มเติมใน reply ได้</p>
            <button
              data-testid="thread-submit"
              type="submit"
              disabled={submittingThread}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-60"
            >
              <MessageSquareText className="h-4 w-4" />
              {submittingThread ? "กำลังโพสต์..." : "โพสต์คำถาม"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-[28px] border border-dashed border-rose-200 bg-rose-50/70 px-5 py-4 text-sm leading-7 text-slate-600">
          ต้องเข้าสู่ระบบและมีสิทธิ์เข้าเรียนคอร์สก่อน จึงจะถามคำถามหรือตอบกลับในส่วนนี้ได้
        </div>
      )}

      <div className="space-y-4">
        {threads.length > 0 ? (
          threads.map((thread) => {
            const replyCount = thread.replies?.length ?? 0
            const hasInstructorReply = thread.replies?.some((reply) => isInstructor(reply.user?.role)) ?? false

            return (
              <article key={thread.id} className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm" data-testid="discussion-thread">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {thread.isPinned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold text-white">
                          <Pin className="h-3 w-3" />
                          ปักหมุด
                        </span>
                      )}
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                        คำถาม
                      </span>
                      {hasInstructorReply && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                          <Shield className="h-3 w-3" />
                          มีคำตอบจากผู้สอน
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-950">{thread.title}</h3>
                    <p className="mt-2 text-xs text-slate-400">
                      โดย {getDisplayName(thread.user)} • อัปเดตล่าสุด {formatDateTime(thread.updatedAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Replies</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{replyCount}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-3xl bg-[#fff8f6] px-4 py-4">
                  <p className="text-sm leading-7 text-slate-700">{thread.content}</p>
                </div>

                {replyCount > 0 && (
                  <div className="mt-4 space-y-3 border-l-2 border-rose-100 pl-4">
                    {thread.replies?.map((reply) => {
                      const instructorReply = isInstructor(reply.user?.role)

                      return (
                        <div key={reply.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-slate-900">{getDisplayName(reply.user)}</p>
                              {instructorReply && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2 py-0.5 text-[11px] font-semibold text-white">
                                  <Shield className="h-3 w-3" />
                                  ผู้สอน
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400">{formatDateTime(reply.createdAt)}</p>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{reply.content}</p>
                        </div>
                      )
                    })}
                  </div>
                )}

                {canPost && (
                  <div className="mt-4 rounded-3xl border border-dashed border-rose-200 bg-rose-50/60 p-3">
                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={replyDrafts[thread.id] ?? ""}
                        onChange={(event) =>
                          setReplyDrafts((previous) => ({
                            ...previous,
                            [thread.id]: event.target.value,
                          }))
                        }
                        placeholder="เขียนคำตอบ เสริมบริบท หรือแชร์วิธีแก้ให้เพื่อน"
                        className="min-h-0 flex-1 resize-none rounded-2xl border border-rose-100 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-rose-300"
                      />
                      <button
                        type="button"
                        onClick={() => void handleReply(thread.id)}
                        disabled={submittingReplyId === thread.id}
                        className="inline-flex h-fit items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {submittingReplyId === thread.id ? "ส่ง..." : "ตอบกลับ"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })
        ) : (
          <div className="rounded-[28px] border border-dashed border-rose-200 bg-rose-50/70 px-5 py-8 text-sm leading-7 text-slate-500">
            ยังไม่มีคำถามในส่วนนี้ คุณสามารถเป็นคนแรกที่เริ่มต้นบทสนทนาได้เลย
          </div>
        )}
      </div>
    </section>
  )
}
