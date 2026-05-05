import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
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
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/courses/${courseId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับไปจัดการบทเรียน
      </Link>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">แก้ไขบทเรียน</h1>
          <p className="mt-1 text-sm text-slate-500">รองรับการแก้เนื้อหา สลับ preview และลบบทเรียน</p>
        </div>

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

        <div className="border-t border-slate-100 pt-4">
          <DeleteButton
            apiPath={`/api/lessons/${lesson.id}`}
            label="ลบบทเรียนนี้"
            confirmMessage={`ลบบทเรียน "${lesson.title}" ใช่หรือไม่?`}
            redirectTo={`/admin/courses/${courseId}`}
          />
        </div>
      </div>
    </div>
  )
}
