"use client"

import { useMemo, useState } from "react"
import { Star } from "lucide-react"
import { useSession } from "next-auth/react"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"
import { formatDateTime } from "@/lib/format"
import type { CourseReview } from "@/types"

type Props = {
  courseId: string
  initialReviews: Array<CourseReview & { user?: { id: string; email: string; name?: string | null } }>
  initialRatingAverage: number
  initialRatingCount: number
  canReview: boolean
}

function StarRow({ rating, onSelect }: { rating: number; onSelect?: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect?.(value)}
          className={onSelect ? "transition hover:scale-105" : "cursor-default"}
        >
          <Star className={`h-4 w-4 ${value <= rating ? "fill-rose-500 text-rose-500" : "text-slate-300"}`} />
        </button>
      ))}
    </div>
  )
}

export function CourseRatingPanel({
  courseId,
  initialReviews,
  initialRatingAverage,
  initialRatingCount,
  canReview,
}: Props) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState(initialReviews)
  const [summary, setSummary] = useState({
    ratingAverage: initialRatingAverage,
    ratingCount: initialRatingCount,
  })
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const currentUserReview = useMemo(
    () => reviews.find((entry) => entry.userId === session?.user?.id),
    [reviews, session?.user?.id]
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          review: reviewText.trim() ? reviewText.trim() : null,
        }),
      })

      const result = await readApiPayload(response)
      if (!response.ok) {
        setError(extractApiError(result, "ยังบันทึกรีวิวไม่ได้ในตอนนี้"))
        return
      }

      if (
        result &&
        typeof result === "object" &&
        "review" in result &&
        "summary" in result &&
        result.review &&
        result.summary
      ) {
        const payload = result as {
          review: CourseReview & { user?: { id: string; email: string; name?: string | null } }
          summary: { ratingAverage: number; ratingCount: number }
        }

        setReviews((previous) => {
          const filtered = previous.filter((entry) => entry.id !== payload.review.id && entry.userId !== payload.review.userId)
          return [payload.review, ...filtered]
        })
        setSummary(payload.summary)
        setReviewText("")
      }
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className="rounded-[32px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_100%)] p-6 shadow-[0_24px_70px_-50px_rgba(159,18,57,0.45)]"
      data-testid="course-rating-panel"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Reviews</p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">คะแนนและรีวิวจากผู้เรียน</h2>
        </div>
        <div className="rounded-[24px] border border-rose-100 bg-white px-4 py-3 text-right shadow-sm">
          <div className="flex items-center justify-end gap-2">
            <span className="text-3xl font-black text-rose-600">{summary.ratingAverage.toFixed(1)}</span>
            <StarRow rating={Math.round(summary.ratingAverage)} />
          </div>
          <p className="mt-1 text-sm text-slate-500">{summary.ratingCount} รีวิว</p>
        </div>
      </div>

      {canReview ? (
        <form onSubmit={handleSubmit} className="mb-6 rounded-[28px] border border-rose-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {currentUserReview ? "อัปเดตรีวิวของคุณ" : "ให้คะแนนคอร์สนี้"}
              </p>
              <p className="text-xs text-slate-500">รีวิวจะโชว์บนหน้าคอร์สเพื่อช่วยผู้เรียนคนอื่นตัดสินใจ</p>
            </div>
            <StarRow rating={rating} onSelect={setRating} />
          </div>

          <textarea
            data-testid="course-review-input"
            rows={4}
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="เขียนความเห็นสั้น ๆ เกี่ยวกับคอร์สนี้"
            className="w-full resize-none rounded-2xl border border-rose-100 bg-[#fff8f6] px-4 py-3 text-sm outline-none transition focus:border-rose-300 focus:bg-white"
          />

          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="mt-3 flex items-center justify-end">
            <button
              data-testid="course-review-submit"
              type="submit"
              disabled={submitting}
              className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {submitting ? "กำลังบันทึก..." : currentUserReview ? "อัปเดตรีวิว" : "ส่งรีวิว"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 rounded-[28px] border border-dashed border-rose-200 bg-rose-50/70 px-4 py-4 text-sm text-slate-600">
          ต้องเข้าสู่ระบบและมีสิทธิ์เข้าเรียนคอร์สก่อน จึงจะให้คะแนนหรือเขียนรีวิวได้
        </div>
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.slice(0, 6).map((entry) => (
            <article key={entry.id} className="rounded-[28px] border border-rose-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{entry.user?.name || entry.user?.email || "ผู้เรียน"}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(entry.updatedAt)}</p>
                </div>
                <StarRow rating={entry.rating} />
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{entry.review || "ให้คะแนนคอร์สนี้โดยยังไม่ได้เขียนความเห็นเพิ่มเติม"}</p>
            </article>
          ))
        ) : (
          <div className="rounded-[28px] border border-dashed border-rose-200 bg-rose-50/70 px-4 py-6 text-sm text-slate-500">
            ยังไม่มีรีวิวคอร์สนี้
          </div>
        )}
      </div>
    </section>
  )
}
