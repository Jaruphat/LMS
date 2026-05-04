import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
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
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/courses/${course.id}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับไปหน้าคอร์ส
      </Link>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">แก้ไขคอร์ส</h1>
          <p className="mt-1 text-sm text-slate-500">ปรับราคา thumbnail และสถานะ publish จากหน้านี้</p>
        </div>

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

        <div className="border-t border-slate-100 pt-4">
          <DeleteButton
            apiPath={`/api/courses/${course.id}`}
            label="ลบคอร์สนี้"
            confirmMessage={`ลบคอร์ส "${course.title}" ใช่หรือไม่?`}
            redirectTo="/admin/courses"
          />
        </div>
      </div>
    </div>
  )
}
