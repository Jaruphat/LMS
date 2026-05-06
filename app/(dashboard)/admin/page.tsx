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
    <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1ec] text-rose-700">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-black text-slate-950">{value}</p>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const { stats, recentOrders } = await getAdminDashboardData()

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[36px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_100%)] p-6 shadow-[0_24px_70px_-50px_rgba(159,18,57,0.45)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Admin Dashboard</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">ภาพรวมของคอร์ส ผู้ใช้ คำสั่งซื้อ และรายได้</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              ใช้หน้านี้เพื่อตรวจสุขภาพของระบบแบบเร็ว ๆ แล้วต่อไปยังหน้าสร้างคอร์ส, จัดการบทเรียน และอนุมัติคำสั่งซื้อได้ทันที
            </p>
          </div>

          <Link
            href="/admin/courses/new"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <PlusCircle className="h-4 w-4" />
            สร้างคอร์สใหม่
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard label="จำนวนคอร์ส" value={stats.courseCount} icon={BookOpen} />
        <StatsCard label="ผู้ใช้ทั้งหมด" value={stats.userCount} icon={Users} />
        <StatsCard label="รออนุมัติ" value={stats.pendingOrders} icon={Clock3} />
        <StatsCard label="รายได้รวม" value={formatPrice(stats.revenue)} icon={ReceiptText} />
      </div>

      <section className="rounded-[32px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-black text-slate-950">ทางลัดสำหรับผู้ดูแล</h2>
          <p className="mt-1 text-sm text-slate-500">ถ้าต้องการสร้างคอร์สหรือเพิ่มบทเรียน ให้เริ่มจากส่วนนี้ได้เลย</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/courses" className="rounded-[28px] border border-rose-100 bg-[#fff8f6] p-5 transition hover:border-rose-200 hover:bg-white">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm">
              <BookOpen className="h-5 w-5" />
            </div>
            <p className="text-base font-bold text-slate-900">จัดการคอร์ส</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">ดูคอร์สทั้งหมด แก้ไขรายละเอียด ลบคอร์ส และเข้าไปจัดการบทเรียน</p>
          </Link>

          <Link href="/admin/courses/new" className="rounded-[28px] bg-slate-950 p-5 text-white transition hover:bg-slate-800">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
              <PlusCircle className="h-5 w-5" />
            </div>
            <p className="text-base font-bold">สร้างคอร์สใหม่</p>
            <p className="mt-2 text-sm leading-7 text-white/75">สร้างชื่อคอร์ส ราคา ภาพปก สถานะ และบันทึกคอร์สเพื่อไปเพิ่มบทเรียนต่อ</p>
          </Link>

          <Link href="/admin/orders" className="rounded-[28px] border border-rose-100 bg-[#fff8f6] p-5 transition hover:border-rose-200 hover:bg-white">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm">
              <ReceiptText className="h-5 w-5" />
            </div>
            <p className="text-base font-bold text-slate-900">ตรวจคำสั่งซื้อ</p>
            <p className="mt-2 text-sm leading-7 text-slate-500">เปิดสลิป อนุมัติคำสั่งซื้อ และสร้างสิทธิ์เรียนให้ผู้ใช้โดยอัตโนมัติ</p>
          </Link>
        </div>
      </section>

      <section className="rounded-[32px] border border-rose-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">คำสั่งซื้อล่าสุด</h2>
            <p className="mt-1 text-sm text-slate-500">ดูสถานะล่าสุดและติดตามคำสั่งซื้อที่ต้องเข้าไปจัดการต่อ</p>
          </div>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 transition hover:text-rose-600">
            ดูทั้งหมด
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((order) => (
            <div key={order.id} className="rounded-[24px] border border-rose-100 bg-[#fffdfc] p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{order.user.email}</p>
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
