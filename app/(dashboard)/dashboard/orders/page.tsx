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

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">ประวัติคำสั่งซื้อ</h1>
        <p className="mt-2 text-sm text-slate-500">เช็กสถานะ pending, approved, rejected และรายการคอร์สในแต่ละ order</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} data-testid="student-order-card" className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">คำสั่งซื้อ #{order.id.slice(-8)}</p>
                <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <OrderStatusBadge status={order.status} />
                <p className="mt-2 text-sm font-semibold text-slate-900">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-700">{item.course.title}</span>
                  <span className="font-medium text-slate-900">{formatPrice(item.price)}</span>
                </div>
              ))}
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
