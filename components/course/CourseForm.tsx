"use client"

import { ImageIcon, NotebookPen, Sparkles, WalletCards } from "lucide-react"
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
      className="space-y-6"
      data-testid="course-form"
      data-client-ready={clientReady ? "true" : "false"}
    >
      <section className="rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.35)]">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white">
            <NotebookPen className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Course Identity</p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">รายละเอียดหลักสูตร</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              ตั้งชื่อและอธิบายให้ชัดเจนเพื่อให้หน้า catalog, chatbot และระบบแนะนำคอร์สหยิบไปใช้ต่อได้ง่าย
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800">ชื่อคอร์ส</label>
            <input
              data-testid="course-title-input"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800">คำอธิบาย</label>
            <textarea
              data-testid="course-description-input"
              required
              rows={6}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full resize-none rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.28)]">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <WalletCards className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Commerce Setup</p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">ราคาและสถานะ</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              คอร์สแบบ draft จะยังไม่แสดงให้ผู้เรียนเห็น ส่วนคอร์สแบบเผยแพร่จะพร้อมขายและแสดงในหน้า public
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800">ราคา (บาท)</label>
            <input
              data-testid="course-price-input"
              type="number"
              min={0}
              step={1}
              value={price}
              onChange={(event) => setPrice(Number(event.target.value) || 0)}
              className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800">สถานะ</label>
            <select
              data-testid="course-status-input"
              value={status}
              onChange={(event) => setStatus(event.target.value as "DRAFT" | "PUBLISHED")}
              className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            >
              <option value="DRAFT">แบบร่าง</option>
              <option value="PUBLISHED">เผยแพร่</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.28)]">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Cover Media</p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">ภาพปกคอร์ส</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              รองรับทั้ง URL ภายนอกและ path ภายในระบบ เช่น <span className="font-medium text-stone-800">/images/course-cover.jpg</span>
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-800">Thumbnail URL</label>
          <input
            data-testid="course-thumbnail-input"
            type="text"
            value={thumbnailUrl}
            onChange={(event) => setThumbnailUrl(event.target.value)}
            placeholder="https://... หรือ /images/..."
            className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
          />
        </div>
      </section>

      {error && <p className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-stone-200 bg-[#fffaf5] px-4 py-2 text-xs font-semibold text-stone-600">
          <Sparkles className="h-4 w-4 text-amber-700" />
          บันทึกแล้วระบบจะพากลับไปยังหน้าจัดการคอร์ส
        </div>
        <button
          data-testid="course-submit"
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {loading ? "กำลังบันทึก..." : mode === "create" ? "สร้างคอร์ส" : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </div>
    </form>
  )
}
