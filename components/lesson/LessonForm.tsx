"use client"

import { upload } from "@vercel/blob/client"
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
      className="space-y-5"
      data-testid="lesson-form"
      data-client-ready={clientReady ? "true" : "false"}
    >
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">ชื่อบทเรียน</label>
        <input
          data-testid="lesson-title-input"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">สรุปเนื้อหาสั้น ๆ</label>
        <textarea
          data-testid="lesson-summary-input"
          rows={3}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="ใช้สรุปใจความของบทเรียนเพื่อแสดงบนหน้าคอร์สและช่วยตอบใน chatbot"
          className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">ประเภท</label>
          <select
            data-testid="lesson-content-type-input"
            value={contentType}
            onChange={(event) => setContentType(event.target.value as "TEXT" | "VIDEO")}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="TEXT">บทความ (Markdown)</option>
            <option value="VIDEO">วิดีโอ</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">ลำดับ</label>
          <input
            data-testid="lesson-order-input"
            type="number"
            min={0}
            value={order}
            onChange={(event) => setOrder(Number(event.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          ความยาวบทเรียน {contentType === "VIDEO" ? "(เช่น 12:45 หรือ 1 ชม. 20 นาที)" : "(ถ้ามี)"}
        </label>
        <input
          data-testid="lesson-duration-input"
          type="text"
          value={durationText}
          onChange={(event) => setDurationText(event.target.value)}
          placeholder={contentType === "VIDEO" ? "ตัวอย่าง 15:32" : "ตัวอย่าง ใช้เวลาอ่าน 8 นาที"}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
        <input
          data-testid="lesson-preview-toggle"
          type="checkbox"
          checked={isPreview}
          onChange={(event) => setIsPreview(event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        เปิดเป็น preview ให้ยังไม่ซื้อคอร์สดูได้
      </label>

      {contentType === "VIDEO" ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">อัปโหลดไฟล์วิดีโอ</label>
              <input
                key={videoInputKey}
                data-testid="lesson-video-upload-input"
                type="file"
                accept={VIDEO_ACCEPT_ATTRIBUTE}
                onChange={handleVideoFileChange}
                disabled={videoUploading}
                className="block w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
              />
            </div>

            <div className="space-y-1 text-xs text-slate-500">
              <p>{getVideoUploadDescription(videoUploadMode)}</p>
              <p>ขนาดไฟล์สูงสุดสำหรับโหมดนี้: {formatFileSize(maxVideoUploadSize)}</p>
            </div>

            {selectedVideoFile && (
              <p data-testid="lesson-video-selected" className="text-sm text-slate-600">
                {selectedVideoFile.name} ({formatFileSize(selectedVideoFile.size)})
              </p>
            )}

            {(videoUploading || videoUploadProgress > 0) && (
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${videoUploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">{videoUploadProgress}%</p>
              </div>
            )}

            {videoUploadStatus && (
              <p data-testid="lesson-video-upload-status" className="text-sm text-slate-600">
                {videoUploadStatus}
              </p>
            )}

            <button
              data-testid="lesson-video-upload-button"
              type="button"
              onClick={handleVideoUpload}
              disabled={!selectedVideoFile || videoUploading || !clientReady}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {videoUploading ? "กำลังอัปโหลด..." : "อัปโหลดวิดีโอ"}
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Video URL (YouTube หรือไฟล์ .mp4/.webm/.ogg/.mov/.m4v)
            </label>
            <input
              data-testid="lesson-video-url-input"
              type="text"
              required
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">เนื้อหา Markdown</label>
          <textarea
            data-testid="lesson-content-input"
            required
            rows={10}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        data-testid="lesson-submit"
        type="submit"
        disabled={loading || videoUploading}
        className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "กำลังบันทึก..." : mode === "create" ? "เพิ่มบทเรียน" : "บันทึกบทเรียน"}
      </button>
    </form>
  )
}
