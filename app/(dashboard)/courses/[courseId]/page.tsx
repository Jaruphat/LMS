/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import {
  Bot,
  BookOpen,
  ChevronLeft,
  Clock3,
  Eye,
  FileText,
  Lock,
  MessageSquareText,
  PlayCircle,
  Star,
  Users,
} from "lucide-react"
import { notFound } from "next/navigation"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
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
import { getVideoPreviewImage, getVideoSourceLabel } from "@/lib/video"

const VIDEO_FALLBACK_TONES = [
  "from-rose-200 via-amber-100 to-stone-100",
  "from-slate-900 via-rose-950 to-orange-900",
  "from-emerald-200 via-sky-100 to-white",
]

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
    <div className="-mt-8 bg-[#fdf7f4]">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-10">
        <ViewTracker endpoint={`/api/courses/${course.id}/views`} storageKey={`course-view:${course.id}`} />

        <Link
          href="/courses"
          className="mb-6 inline-flex items-center gap-1 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-sm text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-700"
        >
          <ChevronLeft className="h-4 w-4" />
          กลับไปหน้าคอร์ส
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_360px]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[36px] border border-rose-100 bg-white shadow-[0_26px_80px_-60px_rgba(17,24,39,0.35)]">
              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="p-6 lg:p-8">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                      {course.price === 0 ? "เรียนฟรี" : formatPrice(course.price)}
                    </span>
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                      {previewLessons.length} preview
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      {videoLessons.length} วิดีโอ
                    </span>
                  </div>

                  <h1 className="text-3xl font-black leading-tight text-slate-950 md:text-5xl">{course.title}</h1>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{course.description}</p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>สอนโดย {course.creator.email}</span>
                    <span className="text-slate-300">•</span>
                    <span>{course._count.lessons} บทเรียน</span>
                    <span className="text-slate-300">•</span>
                    <span>{course._count.enrollments} ผู้เรียน</span>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl bg-[#fff8f6] p-4">
                      <div className="flex items-center gap-2 text-rose-700">
                        <Star className="h-4 w-4 fill-rose-200 text-rose-500" />
                        <span className="text-xs font-semibold uppercase tracking-[0.18em]">Rating</span>
                      </div>
                      <p className="mt-3 text-3xl font-black text-slate-950">{course.ratingAverage.toFixed(1)}</p>
                      <p className="mt-1 text-sm text-slate-500">{course.ratingCount} รีวิว</p>
                    </div>
                    <div className="rounded-3xl bg-[#fff8f6] p-4">
                      <div className="flex items-center gap-2 text-rose-700">
                        <Eye className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.18em]">Views</span>
                      </div>
                      <p className="mt-3 text-3xl font-black text-slate-950">{course.viewCount}</p>
                      <p className="mt-1 text-sm text-slate-500">ยอดเข้าชมหน้าคอร์ส</p>
                    </div>
                    <div className="rounded-3xl bg-[#fff8f6] p-4">
                      <div className="flex items-center gap-2 text-rose-700">
                        <Users className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-[0.18em]">Audience</span>
                      </div>
                      <p className="mt-3 text-3xl font-black text-slate-950">{course._count.enrollments}</p>
                      <p className="mt-1 text-sm text-slate-500">สมาชิกที่ลงทะเบียนแล้ว</p>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[280px] bg-[#f7ece9]">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.45),_transparent_36%),linear-gradient(135deg,#431407,#0f172a)] text-6xl font-semibold text-white">
                      {course.title.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_18%,rgba(15,23,42,0.62)_100%)]" />
                  <div className="absolute inset-x-5 bottom-5 rounded-[28px] border border-white/20 bg-white/14 p-5 text-white backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/70">ก่อนเริ่มเรียน</p>
                    <p className="mt-2 text-lg font-bold">สามารถดูบท preview และสำรวจ video lesson layout ใหม่ได้จากหน้านี้</p>
                    <p className="mt-2 text-sm leading-7 text-white/85">
                      วิดีโอที่เปิด preview จะโชว์เป็น card แยกชัดเจน เพื่อให้เห็นประเภทบทเรียนและความยาวก่อนตัดสินใจลงทะเบียน
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[36px] border border-rose-100 bg-white p-6 shadow-sm lg:p-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                    Curriculum
                  </span>
                  <h2 className="mt-3 text-3xl font-black text-slate-950">โครงหลักสูตรและ preview ของแต่ละบท</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    บทเรียนวิดีโอจะแสดงเป็น preview card แยกให้ดูง่ายขึ้น ส่วนบทความและโน้ตจะยังอยู่ในรูปแบบแถวรายการเพื่อสแกนเนื้อหาได้เร็ว
                  </p>
                </div>
                <span className="rounded-full border border-rose-100 bg-[#fff8f6] px-4 py-2 text-sm font-semibold text-slate-700">
                  ทั้งหมด {course.lessons.length} บทเรียน
                </span>
              </div>

              {course.lessons.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-rose-200 bg-rose-50/60 px-5 py-8 text-sm text-slate-500">
                  คอร์สนี้ยังไม่มีบทเรียน
                </div>
              ) : (
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => {
                    const canOpen = accessState?.hasFullAccess || lesson.isPreview
                    const isDone = progress?.completedIds.has(lesson.id) ?? false
                    const isVideo = lesson.contentType === "VIDEO"
                    const statusLabel = lesson.isPreview ? "Preview" : canOpen ? "เปิดเรียนได้" : "ต้องซื้อก่อน"

                    if (isVideo) {
                      const previewImage = getVideoPreviewImage(lesson.content) ?? course.thumbnailUrl
                      const fallbackTone = VIDEO_FALLBACK_TONES[index % VIDEO_FALLBACK_TONES.length]

                      const card = (
                        <div className={`grid gap-4 rounded-[30px] border border-rose-100 bg-[#fffdfc] p-4 transition ${canOpen ? "hover:border-rose-300 hover:shadow-sm" : "opacity-85"}`}>
                          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                            <div className={`relative aspect-video overflow-hidden rounded-[24px] bg-gradient-to-br ${fallbackTone}`}>
                              {previewImage ? (
                                <img src={previewImage} alt={lesson.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center">
                                  <PlayCircle className="h-14 w-14 text-white/80" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04),rgba(15,23,42,0.54))]" />
                              <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                                  บทที่ {index + 1}
                                </span>
                                <span className="rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                                  {getVideoSourceLabel(lesson.content)}
                                </span>
                              </div>
                              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
                                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-800">
                                  {statusLabel}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                                  <PlayCircle className="h-3.5 w-3.5" />
                                  วิดีโอ
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col justify-between gap-4">
                              <div>
                                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
                                    {statusLabel}
                                  </span>
                                  {lesson.durationText ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                                      <Clock3 className="h-3.5 w-3.5" />
                                      {lesson.durationText}
                                    </span>
                                  ) : null}
                                  {lesson.viewCount > 0 ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                                      <Eye className="h-3.5 w-3.5" />
                                      ดูแล้ว {lesson.viewCount}
                                    </span>
                                  ) : null}
                                  {isDone ? (
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">เรียนแล้ว</span>
                                  ) : null}
                                </div>

                                <h3 className="text-xl font-black text-slate-950">{lesson.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">
                                  {lesson.summary || "วิดีโอบทนี้ออกแบบให้ดูภาพรวมของหัวข้อและปูทางไปยังบทเรียนถัดไป"}
                                </p>
                              </div>

                              <div className="flex items-center justify-between gap-3 text-sm">
                                <p className="text-slate-500">
                                  {lesson.isPreview
                                    ? "เปิดดูตัวอย่างบทเรียนนี้ได้ทันที"
                                    : canOpen
                                      ? "พร้อมเปิดวิดีโอและเรียนต่อได้"
                                      : "ต้องลงทะเบียนและได้รับสิทธิ์เข้าเรียนก่อน"}
                                </p>
                                <span className={`font-semibold ${canOpen ? "text-rose-700" : "text-slate-400"}`}>
                                  {canOpen ? "เปิดดูบทเรียน" : "ล็อกอยู่"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )

                      return canOpen ? (
                        <Link
                          key={lesson.id}
                          href={`/courses/${course.id}/lessons/${lesson.id}`}
                          aria-label={lesson.title}
                          className="block"
                        >
                          {card}
                        </Link>
                      ) : (
                        <div key={lesson.id}>{card}</div>
                      )
                    }

                    const textLesson = (
                      <div
                        className={`flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-rose-100 px-5 py-4 transition ${
                          canOpen ? "bg-white hover:border-rose-300 hover:bg-[#fffaf9]" : "bg-[#fffdfc] opacity-80"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <span className="pt-0.5 text-sm font-semibold text-slate-300">{index + 1}</span>
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1ec] text-rose-700">
                            {canOpen ? <FileText className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-slate-950">{lesson.title}</h3>
                              <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                                {statusLabel}
                              </span>
                              {isDone ? (
                                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">เรียนแล้ว</span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              {lesson.summary || "บทความหรือโน้ตสำหรับอธิบายแนวคิดเพิ่มเติมของหลักสูตรนี้"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                              {lesson.durationText ? <span>{lesson.durationText}</span> : null}
                              {lesson.viewCount > 0 ? <span>ดูแล้ว {lesson.viewCount}</span> : null}
                            </div>
                          </div>
                        </div>

                        <div className="pt-1 text-sm font-semibold text-slate-400">{canOpen ? "อ่านต่อ" : "ล็อกอยู่"}</div>
                      </div>
                    )

                    return canOpen ? (
                      <Link
                        key={lesson.id}
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        aria-label={lesson.title}
                        className="block"
                      >
                        {textLesson}
                      </Link>
                    ) : (
                      <div key={lesson.id}>{textLesson}</div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="sticky top-24 rounded-[32px] border border-rose-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1ec] text-rose-700">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">สถานะการเข้าถึง</p>
                  <p className="font-semibold text-slate-950">
                    {accessState?.hasFullAccess ? "พร้อมเรียนแล้ว" : accessState?.hasPendingOrder ? "รออนุมัติ" : "ยังไม่ได้ลงทะเบียน"}
                  </p>
                </div>
              </div>

              <div className="mb-5 rounded-[28px] bg-[#fff8f6] p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">ราคา</p>
                    <p className="mt-2 text-3xl font-black text-slate-950">
                      {course.price === 0 ? "ฟรี" : formatPrice(course.price)}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>{course._count.lessons} บทเรียน</p>
                    <p>{previewLessons.length} บท preview</p>
                  </div>
                </div>
              </div>

              {accessState?.hasFullAccess && progress && (
                <div className="mb-5 rounded-[28px] border border-rose-100 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">ความคืบหน้าในการเรียน</span>
                    <span className="font-semibold text-rose-700">{progress.percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-rose-100">
                    <div className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-400" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>
              )}

              {accessState?.hasFullAccess ? (
                firstVisibleLesson ? (
                  <Link
                    href={`/courses/${course.id}/lessons/${firstVisibleLesson.id}`}
                    className="block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    เริ่มเรียน
                  </Link>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
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
                <p className="mt-3 text-xs leading-6 text-slate-500">เพิ่มลงตะกร้าได้หลังเข้าสู่ระบบ และ checkout จะเปิดเฉพาะสมาชิก</p>
              )}

              <div className="mt-5 space-y-3 rounded-[28px] border border-rose-100 bg-[#fffdfc] p-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <PlayCircle className="mt-0.5 h-4 w-4 text-rose-600" />
                  <p>วิดีโอบท preview จะแสดงเป็นการ์ดพร้อมข้อมูลครบก่อนกดเข้าเรียน</p>
                </div>
                <div className="flex items-start gap-3">
                  <MessageSquareText className="mt-0.5 h-4 w-4 text-rose-600" />
                  <p>หลังมีสิทธิ์เข้าเรียนแล้วสามารถใช้ Q&A board เพื่อถามผู้สอนได้โดยตรง</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
          <CourseRatingPanel
            courseId={course.id}
            initialReviews={reviews}
            initialRatingAverage={course.ratingAverage}
            initialRatingCount={course.ratingCount}
            canReview={reviewAllowed}
          />

          <section className="rounded-[32px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f2_100%)] p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">AI Assistant</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">ถามผู้ช่วยได้จากทุกหน้า</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  ถ้าต้องการให้ช่วยสรุปคอร์สนี้ แนะนำบท preview หรือช่วยเลือกคอร์สที่เหมาะกับเป้าหมายของคุณ ให้กดไอคอนหุ่นยนต์ที่ลอยอยู่มุมขวาล่างได้เลย
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] border border-rose-100 bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">ถามเรื่องคอร์สนี้</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">เช่น “คอร์สนี้เหมาะกับใคร” หรือ “เริ่มจากบทไหนดี”</p>
                  </div>
                  <div className="rounded-[22px] border border-rose-100 bg-white px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">ถามเรื่องการซื้อคอร์ส</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">เช่น “วิธี checkout ทำยังไง” หรือ “ติดตามออเดอร์ตรงไหน”</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6">
          <DiscussionBoard
            courseId={course.id}
            title="ถาม-ตอบกับผู้สอนและผู้เรียนในคอร์สนี้"
            description="ใช้พื้นที่นี้ถามเรื่องบทเรียน แชร์ workflow ที่ลองทำ หรือทิ้งบริบทไว้ให้ผู้สอนช่วยตอบได้ง่ายขึ้น"
            canPost={discussionAllowed}
            initialThreads={threads}
          />
        </div>
      </div>
    </div>
  )
}
