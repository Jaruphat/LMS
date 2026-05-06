/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { ArrowRight, ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "@/components/cart/CartProvider"
import { formatPrice } from "@/lib/format"

export function CartPageClient() {
  const { items, total, hydrated, removeItem } = useCart()

  if (!hydrated) {
    return (
      <div className="rounded-[2rem] border border-stone-200 bg-[#fffaf5] p-8 text-sm text-stone-500 shadow-sm">
        กำลังโหลดตะกร้าเรียน...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[2.25rem] border border-stone-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(255,247,237,0.85))] px-8 py-14 text-center shadow-[0_28px_70px_-42px_rgba(68,64,60,0.4)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-stone-900 text-white">
          <ShoppingCart className="h-8 w-8" />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Learning Cart</p>
        <h1 className="mb-3 font-serif text-3xl text-stone-900">ตะกร้ายังว่างอยู่</h1>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-stone-600">
          เลือกหลักสูตรที่อยากเรียนก่อน แล้วค่อยกลับมาชำระเงินเพื่อส่งสลิปและเริ่มกระบวนการอนุมัติการเข้าเรียน
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          ดูหลักสูตรทั้งหมด
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2.25rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(255,241,235,0.88))] px-7 py-8 shadow-[0_28px_70px_-42px_rgba(68,64,60,0.38)] sm:px-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Cart Summary</p>
            <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">ตะกร้าหลักสูตรของคุณ</h1>
            <p className="text-sm leading-7 text-stone-600">
              ตรวจสอบราคาก่อนส่งไปยังหน้า checkout ระบบจะสร้างคำสั่งซื้อและรอแนบสลิปเพื่อให้แอดมินอนุมัติ
              การลงทะเบียนเรียน
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Courses</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{items.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-400">Total</p>
              <p className="mt-2 text-2xl font-semibold text-stone-900">{formatPrice(total)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <section className="space-y-4">
          {items.map((item) => (
            <article
              key={item.courseId}
              className="rounded-[2rem] border border-stone-200 bg-white/95 p-5 shadow-[0_24px_60px_-44px_rgba(41,37,36,0.38)]"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="h-28 w-full overflow-hidden rounded-[1.6rem] bg-stone-100 sm:w-40">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#1c1917,#57534e)] text-sm font-semibold uppercase tracking-[0.24em] text-white">
                      Course
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">พร้อมชำระเงิน</p>
                  <h2 className="text-xl font-semibold text-stone-900">{item.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
                    ระบบจะพาคุณไปยังขั้นตอน checkout เพื่อแนบสลิปและสร้างคำสั่งซื้อสำหรับการตรวจสอบ
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                  <p className="text-lg font-semibold text-stone-900">{formatPrice(item.price)}</p>
                  <button
                    data-testid={`remove-cart-item-${item.courseId}`}
                    type="button"
                    onClick={() => removeItem(item.courseId)}
                    className="mt-0 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 sm:mt-4"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    ลบออก
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        <aside className="h-fit rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_24px_60px_-44px_rgba(41,37,36,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Ready To Continue</p>
          <h2 className="mt-3 font-serif text-2xl text-stone-900">สรุปรายการสั่งซื้อ</h2>

          <div className="mt-6 space-y-4 border-b border-stone-200 pb-5">
            {items.map((item) => (
              <div key={item.courseId} className="flex items-start justify-between gap-3 text-sm">
                <span className="leading-6 text-stone-600">{item.title}</span>
                <span className="font-semibold text-stone-900">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 text-sm text-stone-600">
            <div className="flex items-center justify-between">
              <span>จำนวนหลักสูตร</span>
              <span className="font-semibold text-stone-900">{items.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>ยอดรวมสุทธิ</span>
              <span className="text-lg font-semibold text-stone-900">{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            data-testid="go-to-checkout"
            href="/checkout"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
          >
            ไปหน้า checkout
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-4 text-xs leading-6 text-stone-500">
            เมื่อยืนยันคำสั่งซื้อแล้ว ระบบจะให้คุณแนบสลิปโอนเงินเพื่อรอแอดมินตรวจสอบและอนุมัติการเข้าเรียน
          </p>
        </aside>
      </div>
    </div>
  )
}
