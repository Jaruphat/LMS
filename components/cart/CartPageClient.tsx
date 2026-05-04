/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { Trash2, ShoppingCart } from "lucide-react"
import { useCart } from "@/components/cart/CartProvider"
import { formatPrice } from "@/lib/format"

export function CartPageClient() {
  const { items, total, hydrated, removeItem } = useCart()

  if (!hydrated) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">กำลังโหลดตะกร้า...</div>
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-14 text-center">
        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <h1 className="mb-2 text-2xl font-bold text-slate-900">ตะกร้ายังว่างอยู่</h1>
        <p className="mb-6 text-sm text-slate-500">เลือกคอร์สที่สนใจก่อน แล้วค่อยกลับมาชำระเงินได้เลย</p>
        <Link
          href="/courses"
          className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          ดูคอร์สทั้งหมด
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.courseId} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <div className="h-20 w-28 overflow-hidden rounded-2xl bg-slate-100">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-semibold text-white">
                    Course
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="mb-1 text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="text-sm text-slate-500">พร้อมส่งต่อไปยัง checkout เพื่ออัปโหลดสลิป</p>
              </div>
              <div className="text-right">
                <p className="mb-3 text-sm font-semibold text-slate-900">{formatPrice(item.price)}</p>
                <button
                  data-testid={`remove-cart-item-${item.courseId}`}
                  type="button"
                  onClick={() => removeItem(item.courseId)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  ลบ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">สรุปรายการ</h2>
        <div className="mb-4 space-y-2 border-b border-slate-100 pb-4 text-sm text-slate-600">
          <div className="flex items-center justify-between">
            <span>จำนวนคอร์ส</span>
            <span>{items.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>ยอดรวม</span>
            <span className="font-semibold text-slate-900">{formatPrice(total)}</span>
          </div>
        </div>
        <Link
          data-testid="go-to-checkout"
          href="/checkout"
          className="block rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
        >
          ไปหน้าชำระเงิน
        </Link>
      </aside>
    </div>
  )
}
