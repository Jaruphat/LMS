"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useClientReady } from "@/lib/useClientReady"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"

interface Props {
  mode: "create" | "edit"
  courseId?: string
  initialValues?: {
    title: string
    description: string
    price: number
    thumbnailUrl?: string | null
    status: "DRAFT" | "PUBLISHED"
  }
}

export function CourseForm({ mode, courseId, initialValues }: Props) {
  const router = useRouter()
  const clientReady = useClientReady()
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [description, setDescription] = useState(initialValues?.description ?? "")
  const [price, setPrice] = useState(initialValues?.price ?? 0)
  const [thumbnailUrl, setThumbnailUrl] = useState(initialValues?.thumbnailUrl ?? "")
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialValues?.status ?? "DRAFT")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch(mode === "create" ? "/api/courses" : `/api/courses/${courseId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price,
          thumbnailUrl: thumbnailUrl.trim() ? thumbnailUrl.trim() : null,
          status,
        }),
      })

      const result = await readApiPayload(response)

      if (!response.ok) {
        setError(extractApiError(result, "บันทึกคอร์สไม่สำเร็จ"))
        return
      }

      router.push("/admin/courses")
      router.refresh()
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-testid="course-form"
      data-client-ready={clientReady ? "true" : "false"}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">ชื่อคอร์ส</label>
        <input
          data-testid="course-title-input"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">คำอธิบาย</label>
        <textarea
          data-testid="course-description-input"
          required
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">ราคา (บาท)</label>
          <input
            data-testid="course-price-input"
            type="number"
            min={0}
            step={1}
            value={price}
            onChange={(event) => setPrice(Number(event.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">สถานะ</label>
          <select
            data-testid="course-status-input"
            value={status}
            onChange={(event) => setStatus(event.target.value as "DRAFT" | "PUBLISHED")}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Thumbnail URL</label>
        <input
          data-testid="course-thumbnail-input"
          type="text"
          value={thumbnailUrl}
          onChange={(event) => setThumbnailUrl(event.target.value)}
          placeholder="https://... or /images/..."
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        data-testid="course-submit"
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "กำลังบันทึก..." : mode === "create" ? "สร้างคอร์ส" : "บันทึกการเปลี่ยนแปลง"}
      </button>
    </form>
  )
}
