/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { ChevronLeft, BookOpen, Eye, Lock, MessageSquareText, PlayCircle, Star } from "lucide-react"
import { notFound } from "next/navigation"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { CourseChatbot } from "@/components/chatbot/CourseChatbot"
import { DiscussionBoard } from "@/components/community/DiscussionBoard"
import { ViewTracker } from "@/components/engagement/ViewTracker"
import { CourseRatingPanel } from "@/components/reviews/CourseRatingPanel"
import {
  canJoinCourseDiscussion,
  canReviewCourse,
  getCourse,
  getCourseAccessState,
  getCourseDiscussionThreads,
  getCourseProgress,
  getCourseReviews,
} from "@/lib/data"
import { formatPrice } from "@/lib/format"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const [course, accessState, progress] = await Promise.all([
    getCourse(courseId),
    getCourseAccessState(courseId),
    getCourseProgress(courseId),
  ])

  if (!course) notFound()

  const [reviews, threads, reviewAllowed, discussionAllowed] = await Promise.all([
    getCourseReviews(courseId),
    getCourseDiscussionThreads(courseId),
    canReviewCourse(courseId),
    canJoinCourseDiscussion(courseId),
  ])

  const firstVisibleLesson = course.lessons.find((lesson) => accessState?.hasFullAccess || lesson.isPreview)
  const previewLessons = course.lessons.filter((lesson) => lesson.isPreview)
  const videoLessons = course.lessons.filter((lesson) => lesson.contentType === "VIDEO")

  return (
    <div className="mx-auto max-w-6xl">
      <ViewTracker endpoint={`/api/courses/${course.id}/views`} storageKey={`course-view:${course.id}`} />

      <Link href="/courses" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-700">
        <ChevronLeft className="h-4 w-4" />
        กลับไปหน้าคอร์ส
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.85fr]">
        <section>
          <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="h-64 bg-slate-100">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 text-5xl font-semibold text-white">
                  {course.title.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                  {course.price === 0 ? "ฟรี" : formatPrice(course.price)}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {course._count.lessons} บทเรียน
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {course._count.enrollments} ผู้เรียน
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {previewLessons.length} preview
                </span>
              </div>

              <h1 className="mb-3 text-3xl font-bold text-slate-900">{course.title}</h1>
              <p className="mb-4 text-base leading-relaxed text-slate-600">{course.description}</p>
              <p className="text-sm text-slate-400">สอนโดย {course.creator.email}</p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-amber-500">
                <Star className="h-4 w-4 fill-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Rating</span>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">{course.ratingAverage.toFixed(1)}</p>
              <p className="mt-1 text-sm text-slate-500">{course.ratingCount} รีวิว</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-cyan-600">
                <Eye className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Views</span>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">{course.viewCount}</p>
              <p className="mt-1 text-sm text-slate-500">ยอดเข้าชมหน้าคอร์ส</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-indigo-600">
                <PlayCircle className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Video Lessons</span>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">{videoLessons.length}</p>
              <p className="mt-1 text-sm text-slate-500">คลิปวิดีโอในคอร์สนี้</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <MessageSquareText className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Preview</span>
              </div>
              <p className="mt-3 text-3xl font-black text-slate-950">{previewLessons.length}</p>
              <p className="mt-1 text-sm text-slate-500">บทที่เปิดให้ทดลองเรียน</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">บทเรียนในคอร์ส</h2>
                <p className="text-sm text-slate-500">บทเรียน preview ดูได้ก่อนซื้อ ส่วนบทที่เหลือต้องมีสิทธิ์เข้าเรียน</p>
              </div>
              <span className="text-sm text-slate-400">{course.lessons.length} รายการ</span>
            </div>

            {course.lessons.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400">คอร์สนี้ยังไม่มีบทเรียน</p>
            ) : (
              <ol className="divide-y divide-slate-100">
                {course.lessons.map((lesson, index) => {
                  const canOpen = accessState?.hasFullAccess || lesson.isPreview
                  const isDone = progress?.completedIds.has(lesson.id) ?? false

                  const content = (
                    <>
                      <div className="flex items-start gap-4">
                        <span className="w-6 pt-0.5 text-right text-sm text-slate-300">{index + 1}</span>
                        {lesson.isPreview ? (
                          <Eye className="mt-0.5 h-4 w-4 text-cyan-500" />
                        ) : canOpen ? (
                          <PlayCircle className="mt-0.5 h-4 w-4 text-indigo-500" />
                        ) : (
                          <Lock className="mt-0.5 h-4 w-4 text-slate-300" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-700">{lesson.title}</p>
                          <p className="text-xs text-slate-400">
                            {lesson.isPreview ? "Preview" : canOpen ? "เปิดเรียนได้" : "ต้องซื้อก่อน"}
                            {lesson.durationText ? ` • ${lesson.durationText}` : ""}
                            {lesson.viewCount > 0 ? ` • ดูแล้ว ${lesson.viewCount}` : ""}
                          </p>
                          {lesson.summary ? <p className="mt-1 text-xs leading-6 text-slate-500">{lesson.summary}</p> : null}
                        </div>
                      </div>
                      {isDone && <span className="text-xs font-medium text-emerald-600">เรียนแล้ว</span>}
                    </>
                  )

                  return canOpen ? (
                    <li key={lesson.id}>
                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50"
                      >
                        {content}
                      </Link>
                    </li>
                  ) : (
                    <li key={lesson.id} className="flex items-center justify-between gap-4 px-6 py-4 opacity-75">
                      {content}
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">สถานะการเข้าถึง</p>
                <p className="font-semibold text-slate-900">
                  {accessState?.hasFullAccess ? "พร้อมเรียนแล้ว" : accessState?.hasPendingOrder ? "รออนุมัติ" : "ยังไม่ได้ลงทะเบียน"}
                </p>
              </div>
            </div>

            {accessState?.hasFullAccess && progress && (
              <div className="mb-5 rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">ความคืบหน้า</span>
                  <span className="font-semibold text-indigo-600">{progress.percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {accessState?.hasFullAccess ? (
              firstVisibleLesson ? (
                <Link
                  href={`/courses/${course.id}/lessons/${firstVisibleLesson.id}`}
                  className="block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
                >
                  เริ่มเรียน
                </Link>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                  คอร์สนี้ยังไม่มีบทเรียน
                </div>
              )
            ) : (
              <AddToCartButton
                course={{
                  id: course.id,
                  title: course.title,
                  price: course.price,
                  thumbnailUrl: course.thumbnailUrl,
                }}
                callbackPath={`/courses/${course.id}`}
                isEnrolled={accessState?.isEnrolled ?? false}
                hasPendingOrder={accessState?.hasPendingOrder ?? false}
              />
            )}

            {!accessState?.user && !accessState?.hasFullAccess && (
              <p className="mt-3 text-xs text-slate-500">เพิ่มลงตะกร้าได้หลังเข้าสู่ระบบ และ checkout จะเปิดเฉพาะสมาชิก</p>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <CourseRatingPanel
          courseId={course.id}
          initialReviews={reviews}
          initialRatingAverage={course.ratingAverage}
          initialRatingCount={course.ratingCount}
          canReview={reviewAllowed}
        />
        <CourseChatbot courseId={course.id} courseTitle={course.title} />
      </div>

      <div className="mt-6">
        <DiscussionBoard
          courseId={course.id}
          title="เว็บบอร์ดคอร์ส"
          description="ใช้ถามคำถาม แชร์สิ่งที่ลองทำ หรือคุยเรื่อง workflow และบทเรียนในคอร์สนี้กับผู้เรียนคนอื่น"
          canPost={discussionAllowed}
          initialThreads={threads}
        />
      </div>
    </div>
  )
}
