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
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[36px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_100%)] p-6 shadow-[0_24px_70px_-50px_rgba(159,18,57,0.45)] lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">My Courses</p>
        <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">คอร์สที่ได้รับอนุมัติและพร้อมเข้าเรียน</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          ใช้หน้านี้เพื่อดูรายการคอร์สทั้งหมดที่เปิดให้เรียนแล้ว พร้อมทางลัดกลับไปหน้าคอร์สหรือกระโดดเข้า lesson แรกได้ทันที
        </p>
      </section>

      <div className="space-y-4">
        {enrollments.map((enrollment) => {
          const firstLesson = enrollment.course.lessons[0]

          return (
            <div key={enrollment.id} data-testid="student-course-card" className="rounded-[32px] border border-rose-100 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1ec] text-rose-700">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-950">{enrollment.course.title}</h2>
                      <p className="text-sm text-slate-500">{enrollment.course._count.lessons} บทเรียน</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">อนุมัติเมื่อ {formatDateTime(enrollment.enrolledAt)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/courses/${enrollment.course.id}`}
                    className="rounded-full border border-rose-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#fff8f6]"
                  >
                    ดูคอร์ส
                  </Link>
                  {firstLesson && (
                    <Link
                      href={`/courses/${enrollment.course.id}/lessons/${firstLesson.id}`}
                      className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
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
          <div className="rounded-[32px] border border-dashed border-rose-200 bg-white px-8 py-12 text-center text-slate-500">
            ยังไม่มีคอร์สที่เปิดให้เรียน
          </div>
        )}
      </div>
    </div>
  )
}
