import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Eye, PencilLine, Plus } from "lucide-react"
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
    <div className="mx-auto max-w-6xl space-y-8">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับไปหน้าจัดการคอร์ส
      </Link>

      <section className="rounded-[2.25rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(255,241,235,0.9))] px-7 py-8 shadow-[0_28px_70px_-42px_rgba(68,64,60,0.38)] sm:px-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Course Curriculum</p>
            <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">{course.title}</h1>
            <p className="text-sm leading-7 text-stone-600">{course.description}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/courses/${course.id}/edit`}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/85 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white"
            >
              <PencilLine className="h-4 w-4" />
              แก้ไขคอร์ส
            </Link>
            <Link
              href={`/admin/courses/${course.id}/lessons/new`}
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              <Plus className="h-4 w-4" />
              เพิ่มบทเรียน
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[1.45rem] border border-white/70 bg-white/80 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Lessons</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{course.lessons.length}</p>
          </div>
          <div className="rounded-[1.45rem] border border-white/70 bg-white/80 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Students</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{course._count.enrollments}</p>
          </div>
          <div className="rounded-[1.45rem] border border-white/70 bg-white/80 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Views</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{course.viewCount}</p>
          </div>
          <div className="rounded-[1.45rem] border border-white/70 bg-white/80 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Rating</p>
            <p className="mt-2 text-2xl font-semibold text-stone-900">{course.ratingAverage.toFixed(1)}</p>
          </div>
          <div className="rounded-[1.45rem] border border-white/70 bg-white/80 px-4 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Status</p>
            <p className="mt-2 text-lg font-semibold text-stone-900">{course.status}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.75fr]">
        <section className="space-y-4">
          {course.lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="rounded-[2rem] border border-stone-200 bg-white/95 p-5 shadow-[0_24px_60px_-44px_rgba(41,37,36,0.32)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                      บทที่ {lesson.order}
                    </span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {lesson.contentType}
                    </span>
                    {lesson.isPreview ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Preview</span>
                    ) : null}
                  </div>

                  <h2 className="text-xl font-semibold text-stone-900">{lesson.title}</h2>
                  <p className="mt-2 text-sm text-stone-500">
                    {lesson._count.quizzes} quiz question(s)
                    {lesson.durationText ? ` • ${lesson.durationText}` : ""}
                    {lesson.viewCount > 0 ? ` • ${lesson.viewCount} views` : ""}
                  </p>

                  {lesson.summary ? <p className="mt-3 text-sm leading-7 text-stone-600">{lesson.summary}</p> : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-[#fff7f0]"
                  >
                    <Eye className="h-4 w-4" />
                    ดูบทเรียน
                  </Link>
                  <Link
                    href={`/admin/courses/${course.id}/lessons/${lesson.id}/edit`}
                    className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-[#fff7f0]"
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
            </article>
          ))}

          {course.lessons.length === 0 && (
            <div className="rounded-[2rem] border border-dashed border-stone-300 bg-[#fffaf5] px-8 py-14 text-center text-stone-500">
              ยังไม่มีบทเรียนในคอร์สนี้
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.3)]">
            <h2 className="font-semibold text-stone-900">แนวทางจัดโครงคอร์ส</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-stone-600">
              <p>เปิดด้วยบทเรียน preview ที่ช่วยให้ผู้เรียนเห็นภาพรวมคอร์สหรือผลลัพธ์ที่จะได้รับ</p>
              <p>สลับบทเรียนวิดีโอกับบทสรุปแบบข้อความเพื่อให้ผู้เรียนพักจังหวะและทบทวนได้ง่ายขึ้น</p>
              <p>ถ้าคอร์สมี quiz ให้กระจายไปตามช่วงสำคัญของการเรียน ไม่จำเป็นต้องรวมไว้ท้ายคอร์สทั้งหมด</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-rose-200 bg-rose-50/80 p-6 shadow-[0_24px_60px_-46px_rgba(127,29,29,0.15)]">
            <h2 className="font-semibold text-rose-900">ลบคอร์สนี้</h2>
            <p className="mt-2 text-sm leading-7 text-rose-700">
              ใช้เมื่อต้องการลบทั้งคอร์สและบทเรียนในคอร์สนี้ออกจากระบบ
            </p>
            <div className="mt-5 border-t border-rose-200 pt-5">
              <DeleteButton
                apiPath={`/api/courses/${course.id}`}
                label="ลบคอร์สนี้"
                confirmMessage={`ลบคอร์ส "${course.title}" ใช่หรือไม่?`}
                redirectTo="/admin/courses"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
