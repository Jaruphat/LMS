import Link from "next/link"
import { Bot, ChevronLeft, Eye, FileText, Lock, MessageSquareText, PlayCircle } from "lucide-react"
import { redirect, notFound } from "next/navigation"
import { DiscussionBoard } from "@/components/community/DiscussionBoard"
import { ViewTracker } from "@/components/engagement/ViewTracker"
import { LessonViewer } from "@/components/lesson/LessonViewer"
import { MarkCompleteButton } from "@/components/lesson/MarkCompleteButton"
import { QuizCard } from "@/components/quiz/QuizCard"
import {
  canJoinCourseDiscussion,
  getCourse,
  getCourseAccessState,
  getCourseDiscussionThreads,
  getCourseProgress,
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

  const [user, course, lesson, isCompleted, accessState, courseProgress] = await Promise.all([
    getCurrentUser(),
    getCourse(courseId),
    getLessonForViewer(courseId, lessonId),
    getLessonProgress(lessonId),
    getCourseAccessState(courseId),
    getCourseProgress(courseId),
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

  const typeLabel = lesson.contentType === "VIDEO" ? "วิดีโอ" : "บทความ"
  const lessonIndex = course.lessons.findIndex((item) => item.id === lesson.id)
  const currentPosition = lessonIndex >= 0 ? lessonIndex + 1 : 1
  const totalLessons = course.lessons.length

  return (
    <div className="-mt-8 bg-[#fdf7f4]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8">
        <ViewTracker endpoint={`/api/lessons/${lesson.id}/views`} storageKey={`lesson-view:${lesson.id}`} />

        <section className="overflow-hidden rounded-[36px] bg-[#0f0b0d] text-[#f8e8e5] shadow-[0_30px_90px_-60px_rgba(15,23,42,0.8)]">
          <div className="border-b border-white/10 px-5 py-4 lg:px-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
                  <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1 transition hover:text-white">
                    <ChevronLeft className="h-4 w-4" />
                    กลับไปหน้าคอร์ส
                  </Link>
                  <span className="text-white/20">/</span>
                  <span>{course.title}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-white/50">
                  <span>
                    บทที่ {currentPosition} จาก {totalLessons}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  <span>{typeLabel}</span>
                  {lesson.isPreview ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-white/20" />
                      <span className="text-rose-300">Preview</span>
                    </>
                  ) : null}
                </div>

                <h1 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">{lesson.title}</h1>
              </div>

              <div className="flex flex-col gap-3 lg:items-end">
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                  {lesson.durationText ? <span className="rounded-full border border-white/10 px-3 py-1">{lesson.durationText}</span> : null}
                  <span className="rounded-full border border-white/10 px-3 py-1">ดูแล้ว {lesson.viewCount}</span>
                  {courseProgress ? (
                    <span className="rounded-full border border-white/10 px-3 py-1">ความคืบหน้า {courseProgress.percent}%</span>
                  ) : null}
                </div>
                {user ? <MarkCompleteButton lessonId={lesson.id} completed={isCompleted} /> : null}
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-6">
              <div className="overflow-hidden rounded-[28px] bg-black shadow-2xl">
                <LessonViewer contentType={lesson.contentType as "VIDEO" | "TEXT"} content={lesson.content} />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-rose-300">เกี่ยวกับบทเรียนนี้</p>
                  <p className="mt-3 text-sm leading-7 text-white/80">
                    {lesson.summary ||
                      "บทเรียนนี้เป็นส่วนหนึ่งของ flow การเรียนรู้แบบใหม่ที่เน้นให้ผู้เรียนเห็นบริบทของบทก่อนหน้าและบทถัดไปได้ง่ายขึ้น"}
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-rose-300">แนวทางใช้งาน</p>
                  <p className="mt-3 text-sm leading-7 text-white/80">
                    ถ้าบทนี้เป็น preview คุณสามารถเปิดดูวิดีโอ อ่านสรุป และทำแบบทดสอบได้ทันที ส่วนบทที่ไม่ใช่ preview จะปลดล็อกตามสิทธิ์ของคอร์ส
                  </p>
                </div>
              </div>

              {lesson.quizzes.length > 0 && (
                <div className="mt-6">
                  <div className="mb-4 flex items-center gap-2 text-white">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500/20 text-xs font-bold text-rose-200">
                      Q
                    </div>
                    <h2 className="text-lg font-semibold">แบบทดสอบท้ายบท</h2>
                    <span className="text-xs text-white/45">{lesson.quizzes.length} ข้อ</span>
                  </div>
                  <div className="space-y-3">
                    {lesson.quizzes.map((quiz) => (
                      <QuizCard key={quiz.id} quiz={quiz} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="p-4 lg:p-5">
              <div className="rounded-[28px] border border-white/10 bg-white/5">
                <div className="border-b border-white/10 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">เนื้อหาคอร์ส</p>
                  <h2 className="mt-2 text-base font-semibold text-white">เดินต่อจากบทที่กำลังดูอยู่</h2>
                </div>

                <div className="max-h-[680px] overflow-y-auto p-3">
                  <div className="space-y-2">
                    {course.lessons.map((courseLesson, index) => {
                      const canOpen =
                        accessState?.hasFullAccess || courseLesson.isPreview || course.price === 0 || user?.role === "ADMIN"
                      const active = courseLesson.id === lesson.id
                      const lessonHref = `/courses/${course.id}/lessons/${courseLesson.id}`

                      return canOpen ? (
                        <Link
                          key={courseLesson.id}
                          href={lessonHref}
                          className={`block rounded-[22px] border px-4 py-3 transition ${
                            active
                              ? "border-rose-300 bg-rose-500/10 text-white"
                              : "border-white/10 bg-transparent text-white/70 hover:border-white/20 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl ${active ? "bg-rose-400/20 text-rose-200" : "bg-white/6 text-white/55"}`}>
                              {courseLesson.contentType === "VIDEO" ? <PlayCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] uppercase tracking-[0.16em] text-white/35">บท {index + 1}</span>
                                {courseLesson.isPreview ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-300/30 bg-rose-400/10 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                                    <Eye className="h-3 w-3" />
                                    Preview
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 text-sm font-medium leading-6">{courseLesson.title}</p>
                              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/40">
                                <span>{courseLesson.contentType === "VIDEO" ? "วิดีโอ" : "บทความ"}</span>
                                {courseLesson.durationText ? <span>{courseLesson.durationText}</span> : null}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div key={courseLesson.id} className="rounded-[22px] border border-white/10 px-4 py-3 text-white/35">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/5">
                              <Lock className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] uppercase tracking-[0.16em] text-white/25">บท {index + 1}</span>
                              <p className="mt-1 text-sm font-medium leading-6">{courseLesson.title}</p>
                              <p className="mt-2 text-[11px] text-white/25">ต้องลงทะเบียนก่อนจึงจะเปิดบทนี้ได้</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.94fr]">
          <DiscussionBoard
            courseId={courseId}
            lessonId={lesson.id}
            title="ถามตอบในบทเรียนนี้"
            description="ใช้พื้นที่นี้ถามเรื่องเนื้อหาในคลิป แชร์ปัญหาที่ติด หรือช่วยตอบให้เพื่อนในบทเรียนเดียวกัน"
            canPost={discussionAllowed}
            initialThreads={threads}
          />
          <section className="rounded-[32px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f2_100%)] p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Floating Assistant</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">ให้ bot ช่วยต่อจากบทที่กำลังเรียนได้</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  ถามต่อจากบริบทของบทเรียนนี้ได้ทันทีจากไอคอนหุ่นยนต์มุมขวาล่าง เช่นให้สรุปบทนี้ แนะนำบทถัดไป หรือช่วยเลือกคอร์สอื่นที่ใกล้กับสิ่งที่กำลังเรียนอยู่
                </p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-[22px] border border-rose-100 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                    ตัวอย่างคำถาม: “บทนี้สอนเรื่องอะไร”, “ควรดูบทถัดไปไหน”, “มีคอร์สอื่นที่ต่อยอดจากหัวข้อนี้ไหม”
                  </div>
                  <div className="rounded-[22px] border border-rose-100 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
                    bot สามารถตอบได้ทั้งเรื่องคอร์ส เนื้อหา preview วิธีสั่งซื้อ และการใช้งานระบบโดยไม่ต้องออกจากหน้าเรียน
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-[32px] border border-rose-100 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-700">
            <MessageSquareText className="h-4 w-4 text-rose-600" />
            <p className="text-sm font-semibold">ออกแบบให้ถามต่อจากบริบทบทเรียนได้ทันที</p>
          </div>
          <p className="text-sm leading-7 text-slate-600">
            หน้า player ใหม่พยายามวาง video, curriculum, quiz และ Q&A ให้เชื่อมกันมากขึ้น เพื่อให้ผู้เรียนไม่ต้องสลับหน้าไปมาเวลาเรียนจริง
          </p>
        </div>
      </div>
    </div>
  )
}
