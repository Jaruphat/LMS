/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ArrowRight, BookOpen, Clock3, Eye, Users } from "lucide-react"
import { formatPrice } from "@/lib/format"

const CATEGORY_STYLES = [
  "bg-rose-100 text-rose-700",
  "bg-amber-100 text-amber-700",
  "bg-stone-200 text-stone-700",
  "bg-emerald-100 text-emerald-700",
  "bg-sky-100 text-sky-700",
  "bg-indigo-100 text-indigo-700",
]

const CATEGORIES = ["Automation", "AI Workflow", "Data Ops", "No-code", "Prompt Design", "Business Flow"]
const LEVELS = ["เริ่มต้น", "ต่อยอดใช้งาน", "เข้มข้นขึ้น"]

function hashNum(str: string, mod: number) {
  let hash = 0
  for (let index = 0; index < str.length; index++) {
    hash = (hash * 31 + str.charCodeAt(index)) % mod
  }

  return hash
}

function StarSummary({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  if (reviewCount === 0) {
    return <span className="text-xs font-semibold text-slate-400">ยังไม่มีรีวิว</span>
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-rose-600">{rating.toFixed(1)}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => (
          <svg key={value} className={`h-3.5 w-3.5 ${value <= Math.round(rating) ? "star-filled" : "star-empty"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-xs text-slate-400">({reviewCount})</span>
    </div>
  )
}

interface Props {
  course: {
    id: string
    title: string
    description: string
    thumbnailUrl?: string | null
    price: number
    viewCount: number
    ratingAverage?: number
    ratingCount?: number
    creator: { email: string }
    _count: { lessons: number; enrollments: number; reviews: number }
  }
}

export function CourseCard({ course }: Props) {
  const categoryIndex = hashNum(course.id, CATEGORIES.length)
  const levelIndex = hashNum(`${course.id}:level`, LEVELS.length)
  const hourEstimate = 2 + hashNum(`${course.id}:hours`, 12)
  const lessonCount = course._count.lessons
  const reviewCount = course.ratingCount ?? course._count.reviews ?? 0
  const ratingAverage = course.ratingAverage ?? 0

  return (
    <Link href={`/courses/${course.id}`} aria-label={course.title} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[30px] border border-rose-100 bg-[#fffdfc] shadow-[0_24px_70px_-50px_rgba(17,24,39,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-48px_rgba(225,29,72,0.28)]">
        <div className="relative h-52 overflow-hidden bg-[#f7ece9]">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.35),_transparent_32%),linear-gradient(135deg,#431407,#0f172a)]">
              <BookOpen className="h-16 w-16 text-white/35" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#1f1720]/78 via-[#1f1720]/28 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${CATEGORY_STYLES[categoryIndex]}`}>
              {CATEGORIES[categoryIndex]}
            </span>
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700 backdrop-blur">
              {LEVELS[levelIndex]}
            </span>
          </div>

          <span className="absolute right-4 top-4 rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white shadow-sm">
            {course.price === 0 ? "เรียนฟรี" : formatPrice(course.price)}
          </span>

          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-white">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">ผู้สอน</p>
              <p className="mt-1 text-sm font-semibold">{course.creator.email.split("@")[0]}</p>
            </div>
            <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur">
              {hourEstimate} ชั่วโมง
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5 text-rose-500" />
              อัปเดตพร้อมระบบสั่งซื้อ
            </span>
            <span>{lessonCount} บทเรียน</span>
          </div>

          <h3 className="text-lg font-black leading-snug text-slate-950 transition-colors group-hover:text-rose-700">
            {course.title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{course.description}</p>

          <div className="mt-4">
            <StarSummary rating={ratingAverage} reviewCount={reviewCount} />
          </div>

          <div className="mt-auto pt-5">
            <div className="flex items-center justify-between border-t border-rose-100 pt-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-rose-500" />
                  {lessonCount}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-rose-500" />
                  {course._count.enrollments}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-rose-500" />
                  {course.viewCount}
                </span>
              </div>

              <span className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700">
                เปิดดู
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
