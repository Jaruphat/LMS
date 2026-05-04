import type { ComponentType } from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Clock3, PlusCircle, ReceiptText, Users } from "lucide-react"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { getAdminDashboardData } from "@/lib/data"
import { formatDateTime, formatPrice } from "@/lib/format"

function StatsCard({
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

export default async function AdminDashboardPage() {
  const { stats, recentOrders } = await getAdminDashboardData()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">แดชบอร์ดผู้ดูแลระบบ</h1>
        <p className="mt-2 text-sm text-slate-500">ดูภาพรวมคอร์ส ผู้ใช้ คำสั่งซื้อที่รออนุมัติ และรายได้จากคำสั่งซื้อที่อนุมัติแล้ว</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="จำนวนคอร์ส" value={stats.courseCount} icon={BookOpen} />
        <StatsCard label="ผู้ใช้ทั้งหมด" value={stats.userCount} icon={Users} />
        <StatsCard label="รออนุมัติ" value={stats.pendingOrders} icon={Clock3} />
        <StatsCard label="รายได้รวม" value={formatPrice(stats.revenue)} icon={ReceiptText} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">ทางลัดสำหรับผู้ดูแล</h2>
          <p className="text-sm text-slate-500">ถ้าต้องการสร้างคอร์สหรือเพิ่มบทเรียน ให้เริ่มจากส่วนนี้ได้เลย</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/admin/courses"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-slate-900">จัดการคอร์ส</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">ดูคอร์สทั้งหมด แก้ไขรายละเอียด ลบคอร์ส และเข้าไปจัดการบทเรียน</p>
          </Link>

          <Link
            href="/admin/courses/new"
            className="rounded-2xl border border-indigo-200 bg-indigo-600 p-5 text-white transition hover:bg-indigo-700"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
              <PlusCircle className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold">สร้างคอร์สใหม่</p>
            <p className="mt-2 text-sm leading-7 text-indigo-100">สร้างชื่อคอร์ส ราคา ภาพปก สถานะ และบันทึกคอร์สเพื่อไปเพิ่มบทเรียนต่อ</p>
          </Link>

          <Link
            href="/admin/orders"
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ReceiptText className="h-5 w-5" />
            </div>
            <p className="text-base font-semibold text-slate-900">ตรวจคำสั่งซื้อ</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">เปิดสลิป อนุมัติคำสั่งซื้อ และสร้างสิทธิ์เรียนให้ผู้ใช้โดยอัตโนมัติ</p>
          </Link>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">คำสั่งซื้อล่าสุด</h2>
            <p className="text-sm text-slate-500">คำสั่งซื้อล่าสุดและสถานะปัจจุบัน</p>
          </div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{order.user.email}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-slate-600">{order.items.map((item) => item.course.title).join(", ")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
