import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, ShieldAlert } from "lucide-react"
import { DeleteButton } from "@/components/admin/DeleteButton"
import { LessonForm } from "@/components/lesson/LessonForm"
import { db } from "@/lib/db"
import { getVideoUploadMode } from "@/lib/uploads"

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const videoUploadMode = getVideoUploadMode()

  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, courseId },
  })

  if (!lesson) notFound()

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link
        href={`/admin/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับไปจัดการบทเรียน
      </Link>

      <section className="rounded-[2.25rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(255,241,235,0.9))] px-7 py-8 shadow-[0_28px_70px_-42px_rgba(68,64,60,0.38)] sm:px-9">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Lesson Editor</p>
          <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">แก้ไขบทเรียน</h1>
          <p className="text-sm leading-7 text-stone-600">
            อัปเดตเนื้อหา สลับสถานะ preview เปลี่ยนลำดับ หรือแทนที่วิดีโอเดิมได้จากหน้าจอนี้โดยตรง
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.7fr]">
        <div className="min-w-0">
          <LessonForm
            courseId={courseId}
            lessonId={lesson.id}
            mode="edit"
            videoUploadMode={videoUploadMode}
            initialValues={{
              title: lesson.title,
              contentType: lesson.contentType,
              content: lesson.content,
              summary: lesson.summary,
              durationText: lesson.durationText,
              order: lesson.order,
              isPreview: lesson.isPreview,
            }}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.3)]">
            <h2 className="font-semibold text-stone-900">ข้อมูลบทเรียน</h2>
            <div className="mt-5 space-y-3 text-sm text-stone-600">
              <div className="flex items-center justify-between gap-3">
                <span>ประเภท</span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">{lesson.contentType}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>ลำดับปัจจุบัน</span>
                <span className="font-semibold text-stone-900">#{lesson.order}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>สถานะ preview</span>
                <span className="font-semibold text-stone-900">{lesson.isPreview ? "เปิดอยู่" : "ปิดอยู่"}</span>
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
                <p className="text-sm text-rose-700">ใช้เมื่อต้องการลบบทเรียนนี้ออกจากคอร์ส</p>
              </div>
            </div>

            <div className="mt-5 border-t border-rose-200 pt-5">
              <DeleteButton
                apiPath={`/api/lessons/${lesson.id}`}
                label="ลบบทเรียนนี้"
                confirmMessage={`ลบบทเรียน "${lesson.title}" ใช่หรือไม่?`}
                redirectTo={`/admin/courses/${courseId}`}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
