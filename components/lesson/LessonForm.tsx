"use client"

import { upload } from "@vercel/blob/client"
import { Clapperboard, FileText, LayoutTemplate, Sparkles, UploadCloud } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"
import { useClientReady } from "@/lib/useClientReady"
import {
  buildVideoUploadPath,
  VIDEO_ACCEPT_ATTRIBUTE,
  VIDEO_CLIENT_MAX_FILE_SIZE,
  VIDEO_MULTIPART_THRESHOLD,
  VIDEO_SERVER_MAX_FILE_SIZE,
  type VideoUploadMode,
} from "@/lib/videoUpload"

interface Props {
  courseId: string
  lessonId?: string
  mode: "create" | "edit"
  videoUploadMode: VideoUploadMode
  initialValues?: {
    title: string
    contentType: "TEXT" | "VIDEO"
    content: string
    summary?: string | null
    durationText?: string | null
    order: number
    isPreview: boolean
  }
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${bytes} B`
}

function getVideoUploadLimit(mode: VideoUploadMode) {
  return mode === "client-blob" ? VIDEO_CLIENT_MAX_FILE_SIZE : VIDEO_SERVER_MAX_FILE_SIZE
}

function getVideoUploadDescription(mode: VideoUploadMode) {
  if (mode === "client-blob") {
    return "อัปโหลดตรงจากเบราว์เซอร์ไปที่ Vercel Blob เหมาะกับไฟล์วิดีโอขนาดใหญ่และพร้อมใช้บน deployment จริง"
  }

  return "โหมด local fallback จะอัปโหลดผ่านเซิร์ฟเวอร์และเก็บไว้ใน public/uploads/videos สำหรับการพัฒนาในเครื่อง"
}

export function LessonForm({ courseId, lessonId, mode, videoUploadMode, initialValues }: Props) {
  const router = useRouter()
  const clientReady = useClientReady()
  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [contentType, setContentType] = useState<"TEXT" | "VIDEO">(initialValues?.contentType ?? "TEXT")
  const [content, setContent] = useState(initialValues?.content ?? "")
  const [summary, setSummary] = useState(initialValues?.summary ?? "")
  const [durationText, setDurationText] = useState(initialValues?.durationText ?? "")
  const [order, setOrder] = useState(initialValues?.order ?? 0)
  const [isPreview, setIsPreview] = useState(initialValues?.isPreview ?? false)
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null)
  const [videoInputKey, setVideoInputKey] = useState(0)
  const [videoUploadProgress, setVideoUploadProgress] = useState(0)
  const [videoUploadStatus, setVideoUploadStatus] = useState("")
  const [videoUploading, setVideoUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const maxVideoUploadSize = getVideoUploadLimit(videoUploadMode)

  function resetVideoFeedback() {
    setVideoUploadProgress(0)
    setVideoUploadStatus("")
  }

  function handleVideoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null

    setSelectedVideoFile(file)
    setError("")

    if (!file) {
      resetVideoFeedback()
      return
    }

    setVideoUploadProgress(0)
    setVideoUploadStatus(`พร้อมอัปโหลด: ${file.name} (${formatFileSize(file.size)})`)
  }

  async function handleVideoUpload() {
    setError("")

    if (!selectedVideoFile) {
      setError("กรุณาเลือกไฟล์วิดีโอก่อนอัปโหลด")
      return
    }

    if (selectedVideoFile.size > maxVideoUploadSize) {
      setError(`ไฟล์วิดีโอต้องมีขนาดไม่เกิน ${formatFileSize(maxVideoUploadSize)}`)
      return
    }

    setVideoUploading(true)
    setVideoUploadProgress(0)
    setVideoUploadStatus("กำลังอัปโหลดวิดีโอ...")

    try {
      let uploadedUrl = ""

      if (videoUploadMode === "client-blob") {
        const blob = await upload(buildVideoUploadPath(selectedVideoFile.name), selectedVideoFile, {
          access: "public",
          contentType: selectedVideoFile.type || undefined,
          handleUploadUrl: "/api/admin/uploads/video",
          multipart: selectedVideoFile.size > VIDEO_MULTIPART_THRESHOLD,
          onUploadProgress: ({ percentage }) => {
            setVideoUploadProgress(Math.round(percentage))
          },
        })

        uploadedUrl = blob.url
      } else {
        const formData = new FormData()
        formData.append("file", selectedVideoFile)

        const response = await fetch("/api/admin/uploads/video", {
          method: "POST",
          body: formData,
        })

        const result = await readApiPayload(response)

        if (!response.ok) {
          setError(extractApiError(result, "อัปโหลดวิดีโอไม่สำเร็จ"))
          return
        }

        if (!result || typeof result !== "object" || !("url" in result) || typeof result.url !== "string") {
          setError("ระบบไม่ได้ส่งลิงก์วิดีโอกลับมา")
          return
        }

        uploadedUrl = result.url
        setVideoUploadProgress(100)
      }

      setContent(uploadedUrl)
      setVideoUploadStatus("อัปโหลดสำเร็จแล้ว ระบบกรอก Video URL ให้เรียบร้อย")
      setSelectedVideoFile(null)
      setVideoInputKey((current) => current + 1)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "อัปโหลดวิดีโอไม่สำเร็จ")
      resetVideoFeedback()
    } finally {
      setVideoUploading(false)
    }
  }

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
          summary: summary.trim() ? summary.trim() : null,
          durationText: durationText.trim() ? durationText.trim() : null,
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      data-testid="lesson-form"
      data-client-ready={clientReady ? "true" : "false"}
    >
      <section className="rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.35)]">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 text-white">
            <LayoutTemplate className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Lesson Setup</p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">ข้อมูลพื้นฐานของบทเรียน</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              เติมชื่อ สรุป และลำดับการเรียนให้ครบเพื่อให้หน้า course detail และ lesson player แสดงผลได้อย่างเป็นระบบ
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800">ชื่อบทเรียน</label>
            <input
              data-testid="lesson-title-input"
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800">สรุปเนื้อหาสั้น ๆ</label>
            <textarea
              data-testid="lesson-summary-input"
              rows={4}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="สรุปใจความของบทเรียนเพื่อแสดงบนหน้าคอร์สและใช้เป็น context ให้ chatbot"
              className="w-full resize-none rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.28)]">
        <div className="mb-5 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Display Rules</p>
            <h2 className="mt-2 font-serif text-2xl text-stone-900">รูปแบบและสิทธิ์การมองเห็น</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              เลือกว่าบทเรียนนี้เป็นข้อความหรือวิดีโอ กำหนดลำดับ และตัดสินใจว่าจะเปิดเป็น preview ให้ผู้ที่ยังไม่ซื้อคอร์สดูได้หรือไม่
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800">ประเภท</label>
            <select
              data-testid="lesson-content-type-input"
              value={contentType}
              onChange={(event) => setContentType(event.target.value as "TEXT" | "VIDEO")}
              className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            >
              <option value="TEXT">บทความ (Markdown)</option>
              <option value="VIDEO">วิดีโอ</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-800">ลำดับ</label>
            <input
              data-testid="lesson-order-input"
              type="number"
              min={0}
              value={order}
              onChange={(event) => setOrder(Number(event.target.value) || 0)}
              className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-stone-800">
            ความยาวบทเรียน {contentType === "VIDEO" ? "(เช่น 12:45 หรือ 1 ชม. 20 นาที)" : "(ถ้ามี)"}
          </label>
          <input
            data-testid="lesson-duration-input"
            type="text"
            value={durationText}
            onChange={(event) => setDurationText(event.target.value)}
            placeholder={contentType === "VIDEO" ? "ตัวอย่าง 15:32" : "ตัวอย่าง ใช้เวลาอ่าน 8 นาที"}
            className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
          />
        </div>

        <label className="mt-5 flex items-center gap-3 rounded-[1.5rem] border border-stone-200 bg-[#fffaf5] px-4 py-4 text-sm text-stone-700">
          <input
            data-testid="lesson-preview-toggle"
            type="checkbox"
            checked={isPreview}
            onChange={(event) => setIsPreview(event.target.checked)}
            className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-500"
          />
          เปิดเป็น preview ให้ผู้ที่ยังไม่ซื้อคอร์สดูได้
        </label>
      </section>

      {contentType === "VIDEO" ? (
        <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.28)]">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <Clapperboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Video Content</p>
              <h2 className="mt-2 font-serif text-2xl text-stone-900">อัปโหลดหรือแนบวิดีโอ</h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                ใช้การอัปโหลดตรงไปยัง Blob สำหรับ deployment จริง หรือใส่ URL ของ YouTube และไฟล์วิดีโอโดยตรงก็ได้
              </p>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-stone-200 bg-[#fffaf5] p-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-800">อัปโหลดไฟล์วิดีโอ</label>
              <input
                key={videoInputKey}
                data-testid="lesson-video-upload-input"
                type="file"
                accept={VIDEO_ACCEPT_ATTRIBUTE}
                onChange={handleVideoFileChange}
                disabled={videoUploading}
                className="block w-full rounded-[1.2rem] border border-dashed border-stone-300 bg-white px-4 py-3 text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-stone-950 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-stone-800"
              />
            </div>

            <div className="mt-4 space-y-1 text-xs leading-6 text-stone-500">
              <p>{getVideoUploadDescription(videoUploadMode)}</p>
              <p>ขนาดไฟล์สูงสุดสำหรับโหมดนี้: {formatFileSize(maxVideoUploadSize)}</p>
            </div>

            {selectedVideoFile && (
              <p data-testid="lesson-video-selected" className="mt-4 text-sm font-medium text-stone-700">
                {selectedVideoFile.name} ({formatFileSize(selectedVideoFile.size)})
              </p>
            )}

            {(videoUploading || videoUploadProgress > 0) && (
              <div className="mt-4 space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-stone-900 transition-all"
                    style={{ width: `${videoUploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-stone-500">{videoUploadProgress}%</p>
              </div>
            )}

            {videoUploadStatus && (
              <p data-testid="lesson-video-upload-status" className="mt-4 text-sm text-stone-600">
                {videoUploadStatus}
              </p>
            )}

            <button
              data-testid="lesson-video-upload-button"
              type="button"
              onClick={handleVideoUpload}
              disabled={!selectedVideoFile || videoUploading || !clientReady}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UploadCloud className="h-4 w-4" />
              {videoUploading ? "กำลังอัปโหลด..." : "อัปโหลดวิดีโอ"}
            </button>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-stone-800">
              Video URL (YouTube หรือไฟล์ .mp4/.webm/.ogg/.mov/.m4v)
            </label>
            <input
              data-testid="lesson-video-url-input"
              type="text"
              required
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
            />
          </div>
        </section>
      ) : (
        <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.28)]">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Text Content</p>
              <h2 className="mt-2 font-serif text-2xl text-stone-900">เนื้อหา Markdown</h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                ใช้ Markdown สำหรับบทเรียนเชิงบทความ เอกสารประกอบ หรือสรุปแนวคิดสำคัญที่ผู้เรียนต้องอ่าน
              </p>
            </div>
          </div>

          <textarea
            data-testid="lesson-content-input"
            required
            rows={12}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full resize-none rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 font-mono text-sm leading-7 text-stone-900 outline-none transition focus:border-stone-500 focus:ring-4 focus:ring-stone-900/5"
          />
        </section>
      )}

      {error && <p className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-full border border-stone-200 bg-[#fffaf5] px-4 py-2 text-xs font-semibold text-stone-600">
          บันทึกแล้วระบบจะพากลับไปยังหน้าจัดการบทเรียนของคอร์สนี้
        </div>
        <button
          data-testid="lesson-submit"
          type="submit"
          disabled={loading || videoUploading}
          className="inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {loading ? "กำลังบันทึก..." : mode === "create" ? "เพิ่มบทเรียน" : "บันทึกบทเรียน"}
        </button>
      </div>
    </form>
  )
}
