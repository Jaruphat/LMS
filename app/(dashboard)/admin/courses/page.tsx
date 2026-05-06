/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { PencilLine, Plus } from "lucide-react"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { getAdminCourses } from "@/lib/data"
import { formatPrice } from "@/lib/format"

export default async function AdminCoursesPage() {
  const courses = await getAdminCourses()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[36px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_100%)] p-6 shadow-[0_24px_70px_-50px_rgba(159,18,57,0.45)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Admin Courses</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">สร้าง แก้ไข และจัดการหลักสูตรทั้งหมด</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              ใช้หน้านี้ดูคอร์สทั้งหมดในระบบ พร้อมเข้าไปจัดการบทเรียน, แก้ไขรายละเอียด, เปลี่ยนสถานะ และลบคอร์สได้จากที่เดียว
            </p>
          </div>
          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            สร้างคอร์สใหม่
          </Link>
        </div>
      </section>

      <div className="space-y-4">
        {courses.map((course) => (
          <div key={course.id} className="rounded-[32px] border border-rose-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex flex-1 gap-4">
                <div className="h-24 w-36 shrink-0 overflow-hidden rounded-[24px] bg-slate-100">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.35),_transparent_32%),linear-gradient(135deg,#431407,#0f172a)] text-sm font-semibold text-white">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-slate-950">{course.title}</h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        course.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm leading-7 text-slate-500">{course.description}</p>
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
                  className="rounded-full border border-rose-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#fff8f6]"
                >
                  จัดการบทเรียน
                </Link>
                <Link
                  href={`/admin/courses/${course.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-full border border-rose-100 bg-[#fff8f6] px-4 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
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
