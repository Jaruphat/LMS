"use client"

import { useState } from "react"
import { MessageSquareText, Send } from "lucide-react"
import { formatDateTime } from "@/lib/format"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"
import type { DiscussionReply, DiscussionThread } from "@/types"

type ThreadWithRelations = DiscussionThread & {
  user?: { id: string; email: string; name?: string | null }
  replies?: Array<DiscussionReply & { user?: { id: string; email: string; name?: string | null } }>
}

type Props = {
  courseId: string
  lessonId?: string
  title: string
  description: string
  canPost: boolean
  initialThreads: ThreadWithRelations[]
}

export function DiscussionBoard({ courseId, lessonId, title, description, canPost, initialThreads }: Props) {
  const [threads, setThreads] = useState(initialThreads)
  const [threadTitle, setThreadTitle] = useState("")
  const [threadContent, setThreadContent] = useState("")
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [submittingThread, setSubmittingThread] = useState(false)
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null)
  const [error, setError] = useState("")

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
        setError(extractApiError(result, "ยังสร้างกระทู้ไม่ได้ในตอนนี้"))
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
        setError(extractApiError(result, "ยังตอบกระทู้นี้ไม่ได้ในตอนนี้"))
        return
      }

      if (result && typeof result === "object" && "reply" in result && result.reply) {
        const payload = result as {
          reply: DiscussionReply & { user?: { id: string; email: string; name?: string | null } }
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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="discussion-board">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Webboard</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      </div>

      {canPost ? (
        <form onSubmit={handleCreateThread} className="mb-6 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <input
            data-testid="thread-title-input"
            type="text"
            value={threadTitle}
            onChange={(event) => setThreadTitle(event.target.value)}
            placeholder="ตั้งหัวข้อกระทู้"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <textarea
            data-testid="thread-content-input"
            rows={4}
            value={threadContent}
            onChange={(event) => setThreadContent(event.target.value)}
            placeholder="เล่าโจทย์ ปัญหา หรือแชร์สิ่งที่ลองทำแล้ว"
            className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button
              data-testid="thread-submit"
              type="submit"
              disabled={submittingThread}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              <MessageSquareText className="h-4 w-4" />
              {submittingThread ? "กำลังโพสต์..." : "ตั้งกระทู้"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          ต้องเข้าสู่ระบบและมีสิทธิ์เข้าเรียนคอร์สก่อน จึงจะตั้งกระทู้หรือตอบความเห็นได้
        </div>
      )}

      <div className="space-y-4">
        {threads.length > 0 ? (
          threads.map((thread) => (
            <article key={thread.id} className="rounded-3xl border border-slate-200 p-4" data-testid="discussion-thread">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{thread.title}</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    โดย {thread.user?.name || thread.user?.email || "ผู้เรียน"} • {formatDateTime(thread.updatedAt)}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {(thread.replies ?? []).length} ความเห็น
                </span>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-600">{thread.content}</p>

              {(thread.replies ?? []).length > 0 && (
                <div className="mt-4 space-y-3 rounded-3xl bg-slate-50 p-3">
                  {(thread.replies ?? []).map((reply) => (
                    <div key={reply.id} className="rounded-2xl bg-white px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">{reply.user?.name || reply.user?.email || "ผู้เรียน"}</p>
                        <p className="text-xs text-slate-400">{formatDateTime(reply.createdAt)}</p>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{reply.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {canPost && (
                <div className="mt-4 flex gap-2">
                  <textarea
                    rows={2}
                    value={replyDrafts[thread.id] ?? ""}
                    onChange={(event) =>
                      setReplyDrafts((previous) => ({
                        ...previous,
                        [thread.id]: event.target.value,
                      }))
                    }
                    placeholder="ตอบกลับกระทู้นี้"
                    className="min-h-0 flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={() => void handleReply(thread.id)}
                    disabled={submittingReplyId === thread.id}
                    className="inline-flex h-fit items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {submittingReplyId === thread.id ? "ส่ง..." : "ตอบ"}
                  </button>
                </div>
              )}
            </article>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            ยังไม่มีกระทู้ในส่วนนี้
          </div>
        )}
      </div>
    </section>
  )
}
