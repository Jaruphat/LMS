import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { LessonForm } from "@/components/lesson/LessonForm"

export default async function NewLessonPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/courses/${courseId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับไปจัดการบทเรียน
      </Link>

      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">เพิ่มบทเรียนใหม่</h1>
        <LessonForm courseId={courseId} mode="create" />
      </div>
    </div>
  )
}
