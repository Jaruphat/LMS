import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ShieldAlert } from "lucide-react"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { CourseForm } from "@/components/course/CourseForm"
import { getAdminCourse } from "@/lib/data"

export default async function EditCoursePage({
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
        href={`/admin/courses/${course.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับไปหน้าคอร์ส
      </Link>

      <section className="rounded-[2.25rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(255,241,235,0.9))] px-7 py-8 shadow-[0_28px_70px_-42px_rgba(68,64,60,0.38)] sm:px-9">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Course Editor</p>
          <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">แก้ไขข้อมูลหลักสูตร</h1>
          <p className="text-sm leading-7 text-stone-600">
            ปรับราคา ภาพปก คำอธิบาย และสถานะการเผยแพร่จากจุดเดียว เพื่อให้หน้าขายและแดชบอร์ดผู้เรียนแสดงข้อมูลล่าสุดเสมอ
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.7fr]">
        <div className="min-w-0 space-y-6">
          <CourseForm
            mode="edit"
            courseId={course.id}
            initialValues={{
              title: course.title,
              description: course.description,
              price: course.price,
              thumbnailUrl: course.thumbnailUrl,
              status: course.status,
            }}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.3)]">
            <h2 className="font-semibold text-stone-900">ภาพรวมคอร์ส</h2>
            <div className="mt-5 space-y-3 text-sm text-stone-600">
              <div className="flex items-center justify-between gap-3">
                <span>สถานะปัจจุบัน</span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{course.status}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>จำนวนบทเรียน</span>
                <span className="font-semibold text-stone-900">{course.lessons.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>ผู้เรียนที่ลงทะเบียน</span>
                <span className="font-semibold text-stone-900">{course._count.enrollments}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-rose-200 bg-rose-50/80 p-6 shadow-[0_24px_60px_-46px_rgba(127,29,29,0.15)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-rose-900">โซนอันตราย</h2>
                <p className="text-sm text-rose-700">การลบคอร์สจะลบบทเรียนที่เกี่ยวข้องไปด้วย</p>
              </div>
            </div>

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
