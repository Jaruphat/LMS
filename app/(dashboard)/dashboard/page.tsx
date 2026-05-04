import type { ComponentType } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BookOpen, Clock3, ReceiptText } from "lucide-react"
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
    <div className="rounded-3xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">แดชบอร์ดนักเรียน</h1>
        <p className="mt-2 text-sm text-slate-500">ดูคอร์สที่ได้รับสิทธิ์เรียนแล้ว และติดตามคำสั่งซื้อล่าสุดจากที่เดียว</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard label="คอร์สที่เข้าเรียนได้" value={enrollments.length} icon={BookOpen} />
        <DashboardCard label="คำสั่งซื้อรอตรวจสอบ" value={pendingOrders} icon={Clock3} />
        <DashboardCard label="คำสั่งซื้อล่าสุด" value={recentOrders.length} icon={ReceiptText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">คอร์สของฉัน</h2>
            <Link href="/dashboard/my-courses" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              ดูทั้งหมด
            </Link>
          </div>

          <div className="space-y-3">
            {enrollments.slice(0, 4).map((enrollment) => (
              <div key={enrollment.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-900">{enrollment.course.title}</p>
                    <p className="text-sm text-slate-500">
                      ลงทะเบียนเมื่อ {formatDateTime(enrollment.enrolledAt)}
                    </p>
                  </div>
                  <Link
                    href={`/courses/${enrollment.course.id}`}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    เข้าเรียน
                  </Link>
                </div>
              </div>
            ))}

            {enrollments.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                ยังไม่มีคอร์สที่ได้รับอนุมัติ
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">คำสั่งซื้อล่าสุด</h2>
            <Link href="/dashboard/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              ดูทั้งหมด
            </Link>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">คำสั่งซื้อ #{order.id.slice(-6)}</p>
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
