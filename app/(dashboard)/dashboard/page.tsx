import type { ComponentType } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, BookOpen, Clock3, ReceiptText } from "lucide-react"
import { getCurrentUser, getStudentDashboardData } from "@/lib/data"
import { formatDateTime } from "@/lib/format"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"

function DashboardCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1ec] text-rose-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login?callbackUrl=/dashboard")
  if (user.role === "ADMIN") redirect("/admin")

  const { enrollments, recentOrders } = await getStudentDashboardData(user.id)
  const pendingOrders = recentOrders.filter((order) => order.status === "PENDING").length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[36px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_100%)] p-6 shadow-[0_24px_70px_-50px_rgba(159,18,57,0.45)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Student Dashboard</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">ภาพรวมการเรียนและคำสั่งซื้อของคุณในที่เดียว</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              ใช้หน้านี้เพื่อตามคอร์สที่ได้รับสิทธิ์แล้ว, เช็กคำสั่งซื้อที่ยังรออนุมัติ และกลับเข้าไปเรียนต่อจาก flow เดิมได้อย่างรวดเร็ว
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-rose-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">พร้อมเรียนแล้ว</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{enrollments.length}</p>
            </div>
            <div className="rounded-[28px] border border-rose-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">รออนุมัติ</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{pendingOrders}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard label="คอร์สที่เข้าเรียนได้" value={enrollments.length} icon={BookOpen} />
        <DashboardCard label="คำสั่งซื้อรอตรวจสอบ" value={pendingOrders} icon={Clock3} />
        <DashboardCard label="คำสั่งซื้อล่าสุด" value={recentOrders.length} icon={ReceiptText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <section className="rounded-[32px] border border-rose-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">คอร์สของฉัน</h2>
              <p className="mt-1 text-sm text-slate-500">คอร์สที่ได้รับสิทธิ์แล้วและพร้อมกลับเข้าไปเรียนต่อ</p>
            </div>
            <Link href="/dashboard/my-courses" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 transition hover:text-rose-600">
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {enrollments.slice(0, 4).map((enrollment) => (
              <div key={enrollment.id} className="rounded-[24px] border border-rose-100 bg-[#fff8f6] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{enrollment.course.title}</p>
                    <p className="mt-1 text-sm text-slate-500">ลงทะเบียนเมื่อ {formatDateTime(enrollment.enrolledAt)}</p>
                  </div>
                  <Link
                    href={`/courses/${enrollment.course.id}`}
                    className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    เข้าเรียน
                  </Link>
                </div>
              </div>
            ))}

            {enrollments.length === 0 && (
              <div className="rounded-[28px] border border-dashed border-rose-200 px-6 py-10 text-center text-sm text-slate-500">
                ยังไม่มีคอร์สที่ได้รับอนุมัติ
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-rose-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">คำสั่งซื้อล่าสุด</h2>
              <p className="mt-1 text-sm text-slate-500">สรุป order ล่าสุดและสถานะปัจจุบัน</p>
            </div>
            <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 transition hover:text-rose-600">
              ดูทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-[24px] border border-rose-100 bg-[#fffdfc] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">คำสั่งซื้อ #{order.id.slice(-6)}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
              </div>
            ))}

            {recentOrders.length === 0 && <p className="text-sm text-slate-500">ยังไม่มีคำสั่งซื้อ</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
