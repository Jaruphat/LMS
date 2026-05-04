import Link from "next/link"
import { redirect } from "next/navigation"
import { BookOpen } from "lucide-react"
import { getCurrentUser } from "@/lib/data"
import { db } from "@/lib/db"
import { formatDateTime } from "@/lib/format"

export default async function MyCoursesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login?callbackUrl=/dashboard/my-courses")
  if (user.role === "ADMIN") redirect("/admin")

  const enrollments = await db.enrollment.findMany({
    where: { userId: user.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { order: "asc" },
            take: 1,
          },
          _count: { select: { lessons: true } },
        },
      },
    },
  })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">คอร์สของฉัน</h1>
        <p className="mt-2 text-sm text-slate-500">รายการคอร์สที่ได้รับอนุมัติและพร้อมเข้าเรียน</p>
      </div>

      <div className="space-y-4">
        {enrollments.map((enrollment) => {
          const firstLesson = enrollment.course.lessons[0]

          return (
            <div key={enrollment.id} data-testid="student-course-card" className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-slate-900">{enrollment.course.title}</h2>
                  </div>
                  <p className="text-sm text-slate-500">{enrollment.course._count.lessons} บทเรียน</p>
                  <p className="mt-1 text-xs text-slate-400">อนุมัติเมื่อ {formatDateTime(enrollment.enrolledAt)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/courses/${enrollment.course.id}`}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    ดูคอร์ส
                  </Link>
                  {firstLesson && (
                    <Link
                      href={`/courses/${enrollment.course.id}/lessons/${firstLesson.id}`}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      เริ่มเรียน
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {enrollments.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center text-slate-500">
            ยังไม่มีคอร์สที่เปิดให้เรียน
          </div>
        )}
      </div>
    </div>
  )
}
