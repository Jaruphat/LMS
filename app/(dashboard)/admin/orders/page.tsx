/* eslint-disable @next/next/no-img-element */
import { AdminOrderActions } from "@/components/admin/AdminOrderActions"
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge"
import { db } from "@/lib/db"
import { formatDateTime, formatPrice } from "@/lib/format"

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true } },
      items: {
        include: {
          course: {
            select: { title: true },
          },
        },
      },
    },
  })

  const pendingCount = orders.filter((order) => order.status === "PENDING").length
  const approvedCount = orders.filter((order) => order.status === "APPROVED").length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-[36px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff8f6_100%)] p-6 shadow-[0_24px_70px_-50px_rgba(159,18,57,0.45)] lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">Admin Orders</p>
            <h1 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">ตรวจสลิป อนุมัติคำสั่งซื้อ และจัดสิทธิ์เรียน</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              หน้านี้รวบรวมคำสั่งซื้อทั้งหมดไว้ให้ตรวจจากที่เดียว เมื่ออนุมัติแล้วระบบจะสร้าง enrollment ให้ผู้เรียนโดยอัตโนมัติ
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[28px] border border-rose-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">รอตรวจสอบ</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{pendingCount}</p>
            </div>
            <div className="rounded-[28px] border border-rose-100 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">อนุมัติแล้ว</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{approvedCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} data-testid="admin-order-card" className="rounded-[32px] border border-rose-100 bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.88fr_0.72fr]">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-slate-900">{order.user.email}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mb-3 text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-[24px] border border-rose-100 bg-[#fff8f6] px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-700">{item.course.title}</span>
                        <span className="font-semibold text-slate-900">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-700">สลิปการชำระเงิน</p>
                {order.slipUrl ? (
                  order.slipUrl.endsWith(".pdf") ? (
                    <a
                      href={order.slipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-rose-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-[#fff8f6]"
                    >
                      เปิดไฟล์ PDF
                    </a>
                  ) : (
                    <img src={order.slipUrl} alt="Slip" className="max-h-64 rounded-[24px] border border-rose-100 object-contain" />
                  )
                ) : (
                  <div className="rounded-[24px] border border-dashed border-rose-200 px-4 py-10 text-center text-sm text-slate-500">
                    ยังไม่มีการอัปโหลดสลิป
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div className="rounded-[24px] bg-[#fff8f6] p-4">
                  <p className="text-sm text-slate-500">ยอดรวม</p>
                  <p className="mt-2 text-3xl font-black text-slate-950">{formatPrice(order.totalAmount)}</p>
                </div>
                <AdminOrderActions orderId={order.id} status={order.status} />
              </div>
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
