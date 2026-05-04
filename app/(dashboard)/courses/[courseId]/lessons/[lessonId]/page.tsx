import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { ChevronLeft, FileText, PlayCircle } from "lucide-react"
import { LessonViewer } from "@/components/lesson/LessonViewer"
import { MarkCompleteButton } from "@/components/lesson/MarkCompleteButton"
import { QuizCard } from "@/components/quiz/QuizCard"
import { getCourse, getCurrentUser, getLessonForViewer, getLessonProgress } from "@/lib/data"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params

  const [user, course, lesson, isCompleted] = await Promise.all([
    getCurrentUser(),
    getCourse(courseId),
    getLessonForViewer(courseId, lessonId),
    getLessonProgress(lessonId),
  ])

  if (!course) notFound()

  if (!lesson) {
    if (!user) {
      redirect(`/login?callbackUrl=${encodeURIComponent(`/courses/${courseId}/lessons/${lessonId}`)}`)
    }

    redirect(`/courses/${courseId}`)
  }

  const TypeIcon = lesson.contentType === "VIDEO" ? PlayCircle : FileText

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-2">
        <Link href={`/courses/${courseId}`} className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" />
          {lesson.course.title}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="flex items-center gap-1 text-sm text-slate-600">
          <TypeIcon className="h-3.5 w-3.5" />
          {lesson.contentType === "VIDEO" ? "วิดีโอ" : "บทความ"}
        </span>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">{lesson.title}</h1>

      <div className="mb-8">
        <LessonViewer contentType={lesson.contentType as "VIDEO" | "TEXT"} content={lesson.content} />
      </div>

      {lesson.quizzes.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
              <span className="text-xs font-bold text-amber-600">Q</span>
            </div>
            <h2 className="font-semibold text-slate-800">แบบทดสอบ</h2>
            <span className="text-xs text-slate-400">{lesson.quizzes.length} ข้อ</span>
          </div>
          <div className="space-y-3">
            {lesson.quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-5">
        <Link href={`/courses/${courseId}`} className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" />
          กลับไปหน้าคอร์ส
        </Link>
        {user ? <MarkCompleteButton lessonId={lesson.id} completed={isCompleted} /> : null}
      </div>
    </div>
  )
}
