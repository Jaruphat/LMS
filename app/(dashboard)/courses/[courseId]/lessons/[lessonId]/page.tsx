import Link from "next/link"
import { ChevronLeft, Eye, FileText, MessageSquareText, PlayCircle } from "lucide-react"
import { redirect, notFound } from "next/navigation"
import { CourseChatbot } from "@/components/chatbot/CourseChatbot"
import { DiscussionBoard } from "@/components/community/DiscussionBoard"
import { ViewTracker } from "@/components/engagement/ViewTracker"
import { LessonViewer } from "@/components/lesson/LessonViewer"
import { MarkCompleteButton } from "@/components/lesson/MarkCompleteButton"
import { QuizCard } from "@/components/quiz/QuizCard"
import {
  canJoinCourseDiscussion,
  getCourse,
  getCourseDiscussionThreads,
  getCurrentUser,
  getLessonForViewer,
  getLessonProgress,
} from "@/lib/data"

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

  const [threads, discussionAllowed] = await Promise.all([
    getCourseDiscussionThreads(courseId, lessonId),
    canJoinCourseDiscussion(courseId, lessonId),
  ])

  const TypeIcon = lesson.contentType === "VIDEO" ? PlayCircle : FileText

  return (
    <div className="mx-auto max-w-5xl">
      <ViewTracker endpoint={`/api/lessons/${lesson.id}/views`} storageKey={`lesson-view:${lesson.id}`} />

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

      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {lesson.isPreview && (
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
              <Eye className="h-3.5 w-3.5" />
              Preview
            </span>
          )}
          {lesson.durationText && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{lesson.durationText}</span>
          )}
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">ดูแล้ว {lesson.viewCount}</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{lesson.title}</h1>
        {lesson.summary ? <p className="mt-3 text-sm leading-7 text-slate-600">{lesson.summary}</p> : null}
      </div>

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

      <div className="mb-8 flex items-center justify-between border-t border-slate-100 pt-5">
        <Link href={`/courses/${courseId}`} className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-700">
          <ChevronLeft className="h-4 w-4" />
          กลับไปหน้าคอร์ส
        </Link>
        {user ? <MarkCompleteButton lessonId={lesson.id} completed={isCompleted} /> : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.94fr]">
        <DiscussionBoard
          courseId={courseId}
          lessonId={lesson.id}
          title="ถามตอบในบทเรียนนี้"
          description="ใช้พื้นที่นี้ถามเรื่องเนื้อหาในคลิป แชร์ปัญหาที่ติด หรือช่วยตอบให้เพื่อนในบทเรียนเดียวกัน"
          canPost={discussionAllowed}
          initialThreads={threads}
        />
        <CourseChatbot courseId={courseId} courseTitle={lesson.course.title} />
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
        <div className="mb-2 flex items-center gap-2 text-slate-700">
          <MessageSquareText className="h-4 w-4 text-cyan-600" />
          <p className="text-sm font-semibold">แนวทางใช้งาน preview</p>
        </div>
        <p className="text-sm leading-7 text-slate-600">
          ถ้าบทนี้เป็น preview คุณสามารถเปิดวิดีโอ ดูสรุปบท และทำแบบทดสอบได้ทันที ส่วนบทที่ไม่ใช่ preview จะปลดล็อกหลังได้รับสิทธิ์เข้าเรียนของคอร์สนั้น
        </p>
      </div>
    </div>
  )
}
