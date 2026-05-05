import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, PencilLine, Plus } from "lucide-react"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { getAdminCourse } from "@/lib/data"

export default async function AdminCourseLessonsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getAdminCourse(courseId)

  if (!course) notFound()

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/courses" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700">
        <ChevronLeft className="h-4 w-4" />
        กลับไปหน้าจัดการคอร์ส
      </Link>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{course.title}</h1>
            <p className="mt-1 text-sm text-slate-500">{course.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/courses/${course.id}/edit`}
              className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              <PencilLine className="h-4 w-4" />
              แก้ไขคอร์ส
            </Link>
            <Link
              href={`/admin/courses/${course.id}/lessons/new`}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              เพิ่มบทเรียน
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span>{course.lessons.length} บทเรียน</span>
          <span>{course._count.enrollments} ผู้เรียน</span>
          <span>{course.viewCount} views</span>
          <span>{course.ratingAverage.toFixed(1)} / 5 ({course.ratingCount} รีวิว)</span>
          <span>{course.status}</span>
        </div>
      </div>

      <div className="space-y-4">
        {course.lessons.map((lesson) => (
          <div key={lesson.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">
                    #{lesson.order} {lesson.title}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {lesson.contentType}
                  </span>
                  {lesson.isPreview && (
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">Preview</span>
                  )}
                </div>

                <p className="text-sm text-slate-500">
                  {lesson._count.quizzes} quiz question(s)
                  {lesson.durationText ? ` • ${lesson.durationText}` : ""}
                  {lesson.viewCount > 0 ? ` • ${lesson.viewCount} views` : ""}
                </p>

                {lesson.summary ? <p className="mt-2 text-sm leading-7 text-slate-500">{lesson.summary}</p> : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/courses/${course.id}/lessons/${lesson.id}/edit`}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  แก้ไขบทเรียน
                </Link>
                <DeleteButton
                  apiPath={`/api/lessons/${lesson.id}`}
                  label="ลบบทเรียน"
                  confirmMessage={`ลบบทเรียน "${lesson.title}" ใช่หรือไม่?`}
                  redirectTo={`/admin/courses/${course.id}`}
                  variant="ghost"
                />
              </div>
            </div>
          </div>
        ))}

        {course.lessons.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center text-slate-500">
            ยังไม่มีบทเรียนในคอร์สนี้
          </div>
        )}
      </div>
    </div>
  )
}
