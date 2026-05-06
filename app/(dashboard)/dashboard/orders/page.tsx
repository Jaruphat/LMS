import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/data"
import { db } from "@/lib/db"
import { formatDateTime, formatPrice } from "@/lib/format"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"

export default async function DashboardOrdersPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login?callbackUrl=/dashboard/orders")
  if (user.role === "ADMIN") redirect("/admin/orders")

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          course: {
            select: { id: true, title: true },
          },
        },
      },
    },
  })

  const approvedCount = orders.filter((order) => order.status === "APPROVED").length
  const pendingCount = orders.filter((order) => order.status === "PENDING").length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[36px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_100%)] p-6 shadow-[0_24px_70px_-50px_rgba(159,18,57,0.45)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Order History</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">ประวัติคำสั่งซื้อและสถานะการอนุมัติ</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              เช็กได้ว่าคำสั่งซื้อไหนยังรออนุมัติ, อนุมัติแล้ว หรือถูกปฏิเสธ พร้อมดูรายละเอียดคอร์สในแต่ละรายการจากหน้าจอเดียว
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-rose-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">อนุมัติแล้ว</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{approvedCount}</p>
            </div>
            <div className="rounded-[28px] border border-rose-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">รอตรวจสอบ</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{pendingCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} data-testid="student-order-card" className="rounded-[32px] border border-rose-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">คำสั่งซื้อ #{order.id.slice(-8)}</p>
                <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <OrderStatusBadge status={order.status} />
                <p className="mt-2 text-base font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-[24px] border border-rose-100 bg-[#fff8f6] px-4 py-3 text-sm">
                  <span className="text-slate-700">{item.course.title}</span>
                  <span className="font-semibold text-slate-900">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="rounded-[32px] border border-dashed border-rose-200 bg-white px-8 py-12 text-center text-slate-500">
            ยังไม่มีคำสั่งซื้อ
          </div>
        )}
      </div>
    </div>
  )
}
