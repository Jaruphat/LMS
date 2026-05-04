/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { BookOpen, Users, Clock } from "lucide-react"
import { formatPrice } from "@/lib/format"

const CATEGORY_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-cyan-100 text-cyan-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
]

const CATEGORIES = ["งานเขียนโค้ด", "งานออกแบบ", "งานข้อมูล", "งานธุรกิจ", "งานภาษา", "งานคอนเทนต์"]
const LEVELS = ["เริ่มต้น", "ระดับกลาง", "ระดับสูง"]

function hashNum(str: string, mod: number) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % mod
  return h
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= rating ? "star-filled" : "star-empty"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
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
    creator: { email: string }
    _count: { lessons: number; enrollments: number }
  }
}

export function CourseCard({ course }: Props) {
  const catIdx = hashNum(course.id, CATEGORIES.length)
  const levelIdx = hashNum(course.id + "lv", LEVELS.length)
  const rating = 4 + hashNum(course.id + "rt", 2)
  const reviewCount = 10 + hashNum(course.id + "rv", 280)
  const hours = 2 + hashNum(course.id + "hr", 18)

  const category = CATEGORIES[catIdx]
  const level = LEVELS[levelIdx]
  const catColor = CATEGORY_COLORS[catIdx]

  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 h-full flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden bg-slate-100">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
              <BookOpen className="w-16 h-16 text-slate-500 opacity-40" />
            </div>
          )}
          {/* Category badge */}
          <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full ${catColor} shadow-sm`}>
            {category}
          </span>
          {/* Price badge */}
          <span className="absolute top-3 right-3 bg-amber-400 text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {course.price === 0 ? "ฟรี" : formatPrice(course.price)}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          {/* Level */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">{level}</span>
            <span className="text-slate-200">•</span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3" />{hours} ชม.
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-[15px] leading-snug mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="text-xs text-slate-500 mb-3">
            โดย <span className="text-slate-700 font-medium">{course.creator.email.split("@")[0]}</span>
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-amber-500">{rating}.0</span>
            <StarRating rating={rating} />
            <span className="text-xs text-slate-400">({reviewCount})</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                {course._count.lessons} บทเรียน
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                {course._count.enrollments}
              </span>
            </div>
            <span className="text-xs font-semibold text-amber-600 group-hover:underline">
              ดูรายละเอียด →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
