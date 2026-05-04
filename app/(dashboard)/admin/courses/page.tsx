/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { Plus, PencilLine } from "lucide-react"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { getAdminCourses } from "@/lib/data"
import { formatPrice } from "@/lib/format"

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses()

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการคอร์ส</h1>
          <p className="mt-1 text-sm text-slate-500">สร้าง แก้ไข ลบคอร์ส และเข้าไปจัดการบทเรียนได้จากหน้านี้</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          สร้างคอร์สใหม่
        </Link>
      </div>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="h-24 w-36 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-500 text-sm font-semibold text-white">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        course.status === "PUBLISHED"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm text-slate-500">{course.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <span>{formatPrice(course.price)}</span>
                    <span>{course._count.lessons} บทเรียน</span>
                    <span>{course._count.enrollments} ผู้เรียน</span>
                    <span>โดย {course.creator.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/courses/${course.id}`}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  จัดการบทเรียน
                </Link>
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
                >
                  <PencilLine className="h-4 w-4" />
                  แก้ไขคอร์ส
                </Link>
                <DeleteButton
                  apiPath={`/api/courses/${course.id}`}
                  label="ลบคอร์ส"
                  confirmMessage={`ลบคอร์ส "${course.title}" ใช่หรือไม่?`}
                  redirectTo="/admin/courses"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
