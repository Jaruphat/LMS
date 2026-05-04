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

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">จัดการคำสั่งซื้อ</h1>
        <p className="mt-2 text-sm text-slate-500">ตรวจสลิป อนุมัติหรือปฏิเสธคำสั่งซื้อ แล้วให้ enrollment ถูกสร้างอัตโนมัติ</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} data-testid="admin-order-card" className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr_0.7fr]">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-slate-900">{order.user.email}</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mb-3 text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-700">{item.course.title}</span>
                        <span className="font-medium text-slate-900">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">สลิป</p>
                {order.slipUrl ? (
                  order.slipUrl.endsWith(".pdf") ? (
                    <a
                      href={order.slipUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      เปิดไฟล์ PDF
                    </a>
                  ) : (
                    <img src={order.slipUrl} alt="Slip" className="max-h-64 rounded-2xl border border-slate-200 object-contain" />
                  )
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                    ยังไม่มีการอัปโหลดสลิป
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">ยอดรวม</p>
                  <p className="text-2xl font-bold text-slate-900">{formatPrice(order.totalAmount)}</p>
                </div>
                <AdminOrderActions orderId={order.id} status={order.status} />
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center text-slate-500">
            ยังไม่มีคำสั่งซื้อ
          </div>
        )}
      </div>
    </div>
  )
}
