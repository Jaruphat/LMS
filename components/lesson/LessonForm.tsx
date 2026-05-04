"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"

interface Props {
  courseId: string
  lessonId?: string
  mode: "create" | "edit"
  initialValues?: {
    title: string
    contentType: "TEXT" | "VIDEO"
    content: string
    order: number
    isPreview: boolean
  }
}

export function LessonForm({ courseId, lessonId, mode, initialValues }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [contentType, setContentType] = useState<"TEXT" | "VIDEO">(initialValues?.contentType ?? "TEXT")
  const [content, setContent] = useState(initialValues?.content ?? "")
  const [order, setOrder] = useState(initialValues?.order ?? 0)
  const [isPreview, setIsPreview] = useState(initialValues?.isPreview ?? false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(mode === "create" ? "/api/lessons" : `/api/lessons/${lessonId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title,
          contentType,
          content,
          order,
          isPreview,
        }),
      })

      const result = await readApiPayload(response)
      if (!response.ok) {
        setError(extractApiError(result, "บันทึกบทเรียนไม่สำเร็จ"))
        return
      }

      router.push(`/admin/courses/${courseId}`)
      router.refresh()
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">ชื่อบทเรียน</label>
        <input
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">ประเภท</label>
          <select
            value={contentType}
            onChange={(event) => setContentType(event.target.value as "TEXT" | "VIDEO")}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TEXT">บทความ (Markdown)</option>
            <option value="VIDEO">วิดีโอ (YouTube URL)</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">ลำดับ</label>
          <input
            type="number"
            min={0}
            value={order}
            onChange={(event) => setOrder(Number(event.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={isPreview}
          onChange={(event) => setIsPreview(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        เปิดเป็น preview ให้ยังไม่ซื้อคอร์สดูได้
      </label>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {contentType === "VIDEO" ? "YouTube URL" : "เนื้อหา Markdown"}
        </label>
        {contentType === "VIDEO" ? (
          <input
            type="url"
            required
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        ) : (
          <textarea
            required
            rows={10}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "กำลังบันทึก..." : mode === "create" ? "เพิ่มบทเรียน" : "บันทึกบทเรียน"}
      </button>
    </form>
  )
}
