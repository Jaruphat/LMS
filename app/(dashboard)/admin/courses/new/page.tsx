import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { CourseForm } from "@/components/course/CourseForm"

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/courses" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700">
        <ChevronLeft className="h-4 w-4" />
        กลับไปหน้าจัดการคอร์ส
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">สร้างคอร์สใหม่</h1>
        <CourseForm mode="create" />
      </div>
    </div>
  )
}
