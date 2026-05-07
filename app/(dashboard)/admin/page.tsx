import type { ComponentType } from "react"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Bot,
  ChartColumnBig,
  CircleDashed,
  Clock3,
  Layers3,
  PlusCircle,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { getAdminDashboardData } from "@/lib/data"
import { formatDateTime, formatNumber, formatPrice } from "@/lib/format"

function StatsCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string
  helper: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <article className="rounded-[1.8rem] border border-stone-200 bg-white/95 p-5 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.28)]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1ec] text-rose-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">{label}</p>
      <p className="mt-3 text-3xl font-black tabular-nums text-stone-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-stone-500">{helper}</p>
    </article>
  )
}

function SectionShell({
  title,
  description,
  children,
  action,
}: {
  title: string
  description: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.26)]">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl text-stone-950">{title}</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default async function AdminDashboardPage() {
  const { stats, orderBreakdown, lessonComposition, revenueTimeline, topCourses, recentOrders } = await getAdminDashboardData()

  const maxRevenue = Math.max(...revenueTimeline.map((item) => item.revenue), 1)
  const maxOrders = Math.max(...revenueTimeline.map((item) => item.orders), 1)
  const totalOrderCount = orderBreakdown.reduce((sum, item) => sum + item.count, 0)
  const orderPercentages = orderBreakdown.map((item) => ({
    ...item,
    percent: totalOrderCount === 0 ? 0 : Math.round((item.count / totalOrderCount) * 100),
  }))

  const pendingPercent = totalOrderCount === 0 ? 0 : (orderBreakdown[0]?.count ?? 0) / totalOrderCount
  const approvedPercent = totalOrderCount === 0 ? 0 : (orderBreakdown[1]?.count ?? 0) / totalOrderCount

  const orderDonut = `conic-gradient(#f59e0b 0 ${(pendingPercent * 100).toFixed(2)}%, #111827 ${(pendingPercent * 100).toFixed(2)}% ${((pendingPercent + approvedPercent) * 100).toFixed(2)}%, #f43f5e ${((pendingPercent + approvedPercent) * 100).toFixed(2)}% 100%)`

  const lessonVideoPercent = lessonComposition.total === 0 ? 0 : Math.round((lessonComposition.video / lessonComposition.total) * 100)
  const lessonTextPercent = lessonComposition.total === 0 ? 0 : Math.round((lessonComposition.text / lessonComposition.total) * 100)
  const lessonPreviewPercent = lessonComposition.total === 0 ? 0 : Math.round((lessonComposition.preview / lessonComposition.total) * 100)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[2.4rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(255,241,235,0.88))] px-7 py-8 shadow-[0_28px_70px_-42px_rgba(68,64,60,0.38)] sm:px-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Admin Analytics</p>
            <h1 className="font-serif text-3xl text-stone-950 text-balance sm:text-4xl">
              ภาพรวมธุรกิจคอร์สแบบหลายมิติในหน้าเดียว
            </h1>
            <p className="text-sm leading-7 text-stone-600">
              ดูทั้งยอดรายได้ แนวโน้มคำสั่งซื้อ สัดส่วนคอนเทนต์ สุขภาพของคอร์ส และคอร์สที่ควรผลักดันต่อได้จากแดชบอร์ดนี้ทันที
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              <PlusCircle className="h-4 w-4" />
              สร้างคอร์สใหม่
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/85 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white"
            >
              <ReceiptText className="h-4 w-4" />
              ตรวจคำสั่งซื้อ
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          label="Revenue"
          value={formatPrice(stats.revenue)}
          helper={`AOV ${formatPrice(stats.averageOrderValue)} • อนุมัติ ${stats.approvalRate}%`}
          icon={TrendingUp}
        />
        <StatsCard
          label="Orders Pending"
          value={formatNumber(stats.pendingOrders)}
          helper={`อนุมัติแล้ว ${formatNumber(stats.approvedOrders)} • ปฏิเสธ ${formatNumber(stats.rejectedOrders)}`}
          icon={Clock3}
        />
        <StatsCard
          label="Courses & Lessons"
          value={`${formatNumber(stats.courseCount)} / ${formatNumber(stats.totalLessons)}`}
          helper={`เผยแพร่ ${formatNumber(stats.publishedCourses)} • แบบร่าง ${formatNumber(stats.draftCourses)}`}
          icon={BookOpen}
        />
        <StatsCard
          label="Audience"
          value={`${formatNumber(stats.userCount)} คน`}
          helper={`ลงทะเบียนเรียน ${formatNumber(stats.totalEnrollments)} • views ${formatNumber(stats.totalViews)}`}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.95fr]">
        <SectionShell
          title="แนวโน้มรายได้และคำสั่งซื้อ 7 วันล่าสุด"
          description="ดูว่ารายได้จากออเดอร์ที่อนุมัติแล้วไหลเข้ามาในแต่ละวันอย่างไร พร้อมเทียบจำนวนออเดอร์ทั้งหมดในช่วงเดียวกัน"
        >
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-stone-200 bg-[#fffaf5] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">Approved Revenue</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-stone-950">{formatPrice(stats.revenue)}</p>
                </div>
                <div className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600">
                  7 วันล่าสุด
                </div>
              </div>

              <div className="mt-6 flex h-52 items-end gap-3">
                {revenueTimeline.map((item) => (
                  <div key={item.key} className="flex min-w-0 flex-1 flex-col items-center gap-3">
                    <div className="flex h-40 w-full items-end justify-center rounded-full bg-white/75 px-2 pb-2">
                      <div
                        className="w-full rounded-full bg-[linear-gradient(180deg,#fb7185_0%,#f97316_100%)]"
                        style={{ height: `${Math.max(10, (item.revenue / maxRevenue) * 100)}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] font-semibold text-stone-500">{item.label}</p>
                      <p className="mt-1 text-xs tabular-nums text-stone-700">{formatPrice(item.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-stone-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white">
                  <ChartColumnBig className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">จำนวนคำสั่งซื้อรายวัน</p>
                  <p className="text-sm text-stone-500">ใช้ดูความสม่ำเสมอของดีมานด์และช่วงที่ควรเร่งตอบออเดอร์</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {revenueTimeline.map((item) => (
                  <div key={`${item.key}-orders`} className="grid grid-cols-[52px_1fr_auto] items-center gap-3">
                    <span className="text-xs font-semibold text-stone-500">{item.label}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-stone-900"
                        style={{ width: `${Math.max(item.orders === 0 ? 0 : 16, (item.orders / maxOrders) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-stone-900">{formatNumber(item.orders)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionShell>

        <SectionShell
          title="สัดส่วนคำสั่งซื้อและโครงคอนเทนต์"
          description="มองพร้อมกันทั้ง health ของออเดอร์และสมดุลของคอร์ส/บทเรียนในระบบ"
        >
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-[170px_1fr]">
              <div className="flex flex-col items-center justify-center rounded-[1.6rem] border border-stone-200 bg-[#fffaf5] p-5">
                <div
                  aria-hidden="true"
                  className="relative flex h-36 w-36 items-center justify-center rounded-full"
                  style={{ backgroundImage: orderDonut }}
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-center">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Orders</p>
                      <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-950">{formatNumber(totalOrderCount)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {orderPercentages.map((item) => (
                  <div key={item.status} className="rounded-[1.35rem] border border-stone-200 bg-white px-4 py-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <OrderStatusBadge status={item.status} />
                        <span className="text-sm text-stone-600">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-stone-900">
                        {formatNumber(item.count)} รายการ
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className={`h-full rounded-full ${
                            item.status === "PENDING"
                              ? "bg-amber-500"
                              : item.status === "APPROVED"
                                ? "bg-stone-900"
                                : "bg-rose-500"
                          }`}
                          style={{ width: `${item.percent}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs font-semibold tabular-nums text-stone-500">{item.percent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-stone-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff1ec] text-rose-700">
                    <Layers3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">โครงสร้างคอร์ส</p>
                    <p className="text-sm text-stone-500">ฟรี/ขายจริง/เผยแพร่/แบบร่าง</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-stone-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>คอร์สฟรี</span>
                    <span className="font-semibold tabular-nums text-stone-900">{formatNumber(stats.freeCourses)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>คอร์สแบบชำระเงิน</span>
                    <span className="font-semibold tabular-nums text-stone-900">{formatNumber(stats.paidCourses)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>คอร์สเผยแพร่แล้ว</span>
                    <span className="font-semibold tabular-nums text-stone-900">{formatNumber(stats.publishedCourses)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>คอร์สแบบร่าง</span>
                    <span className="font-semibold tabular-nums text-stone-900">{formatNumber(stats.draftCourses)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-stone-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                    <CircleDashed className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">องค์ประกอบบทเรียน</p>
                    <p className="text-sm text-stone-500">วิดีโอ, บทความ และ preview</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-stone-600">วิดีโอ</span>
                      <span className="font-semibold tabular-nums text-stone-900">{lessonVideoPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-stone-900" style={{ width: `${lessonVideoPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-stone-600">บทความ</span>
                      <span className="font-semibold tabular-nums text-stone-900">{lessonTextPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${lessonTextPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-stone-600">เปิด preview</span>
                      <span className="font-semibold tabular-nums text-stone-900">{lessonPreviewPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full rounded-full bg-rose-500" style={{ width: `${lessonPreviewPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionShell
          title="Top Courses ที่ควรจับตา"
          description="จัดอันดับโดยดูจากรายได้ก่อน แล้วตามด้วยจำนวนผู้เรียนและยอดเข้าชม เพื่อช่วยตัดสินใจว่าคอร์สไหนควรผลักดันต่อ"
          action={
            <Link
              href="/admin/courses"
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-[#fff7f0]"
            >
              ไปหน้าจัดการคอร์ส
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <article
                key={course.id}
                className="rounded-[1.6rem] border border-stone-200 bg-[#fffdf9] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold text-white">#{index + 1}</span>
                      <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                        {course.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-stone-950">{course.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-stone-500">
                      <span>{formatNumber(course.lessonCount)} บทเรียน</span>
                      <span>{formatNumber(course.previewCount)} preview</span>
                      <span>{formatNumber(course.videoCount)} วิดีโอ</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[1.2rem] border border-stone-200 bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Revenue</p>
                      <p className="mt-2 text-sm font-semibold tabular-nums text-stone-950">{formatPrice(course.revenue)}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-stone-200 bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Students</p>
                      <p className="mt-2 text-sm font-semibold tabular-nums text-stone-950">{formatNumber(course.enrollmentCount)}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-stone-200 bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Views</p>
                      <p className="mt-2 text-sm font-semibold tabular-nums text-stone-950">{formatNumber(course.viewCount)}</p>
                    </div>
                    <div className="rounded-[1.2rem] border border-stone-200 bg-white px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Rating</p>
                      <p className="mt-2 text-sm font-semibold tabular-nums text-stone-950">
                        {course.ratingAverage.toFixed(1)} / 5
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </SectionShell>

        <div className="space-y-6">
          <SectionShell
            title="Quick Signals"
            description="ตัวชี้วัดสั้น ๆ ที่ใช้จับความเร่งด่วนของระบบในแต่ละวัน"
          >
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-stone-200 bg-[#fffaf5] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Enrollment Efficiency</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-stone-950">{formatNumber(stats.enrollmentRate)}%</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">คิดแบบคร่าว ๆ จากจำนวน enrollment เทียบกับยอดเข้าชมคอร์สทั้งหมด</p>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-[#fffaf5] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Published Courses</p>
                <p className="mt-3 text-3xl font-semibold tabular-nums text-stone-950">{formatNumber(stats.publishedCourses)}</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">จำนวนคอร์สที่พร้อมขายและพร้อมให้ bot แนะนำผู้เรียนได้ทันที</p>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-[#fffaf5] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-white">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-950">ผู้ช่วยแนะนำคอร์สพร้อมใช้งาน</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      ผู้ใช้สามารถถาม bot จากทุกหน้าเรื่องคอร์สที่เหมาะกับตัวเอง เนื้อหา preview และขั้นตอนการซื้อคอร์สได้แล้ว
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SectionShell>

          <SectionShell
            title="คำสั่งซื้อล่าสุด"
            description="เช็กสลิปและผู้ซื้อที่เพิ่งเข้ามา เพื่อดูว่ามีรายการไหนควรรีบอนุมัติก่อน"
            action={
              <Link href="/admin/orders" className="inline-flex items-center gap-2 text-sm font-semibold text-rose-700 transition hover:text-rose-600">
                ดูทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          >
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <article key={order.id} className="rounded-[1.4rem] border border-stone-200 bg-[#fffdf9] p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-stone-950">{order.user.email}</p>
                      <p className="text-xs text-stone-500">{formatDateTime(order.createdAt)}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <p className="text-sm leading-6 text-stone-600">{order.items.map((item) => item.course.title).join(", ")}</p>
                </article>
              ))}
            </div>
          </SectionShell>
        </div>
      </div>
    </div>
  )
}
