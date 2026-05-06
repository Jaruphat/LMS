/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, ReceiptText, ShieldCheck, UploadCloud } from "lucide-react"
import { useCart } from "@/components/cart/CartProvider"
import { formatPrice } from "@/lib/format"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"
import { useClientReady } from "@/lib/useClientReady"

export function CheckoutPageClient() {
  const router = useRouter()
  const clientReady = useClientReady()
  const { items, total, hydrated, clear } = useCart()
  const [error, setError] = useState("")
  const [slip, setSlip] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const previewUrl = useMemo(() => {
    if (!slip || slip.type === "application/pdf") return null
    return URL.createObjectURL(slip)
  }, [slip])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (items.length === 0) {
      setError("ตะกร้าว่างอยู่ กรุณาเลือกคอร์สก่อน")
      return
    }

    if (total > 0 && !slip) {
      setError("กรุณาอัปโหลดสลิปก่อนส่งคำสั่งซื้อ")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const createOrderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseIds: items.map((item) => item.courseId),
        }),
      })

      const createdOrder = await readApiPayload(createOrderResponse)
      if (!createOrderResponse.ok) {
        throw new Error(extractApiError(createdOrder, "ไม่สามารถสร้างคำสั่งซื้อได้"))
      }

      if (!createdOrder || typeof createdOrder !== "object" || !("id" in createdOrder) || !("totalAmount" in createdOrder)) {
        throw new Error("ระบบตอบกลับไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง")
      }

      if (typeof createdOrder.totalAmount === "number" && createdOrder.totalAmount > 0 && slip) {
        const formData = new FormData()
        formData.append("slip", slip)

        const uploadResponse = await fetch(`/api/orders/${createdOrder.id as string}/slip`, {
          method: "POST",
          body: formData,
        })

        const uploadResult = await readApiPayload(uploadResponse)
        if (!uploadResponse.ok) {
          throw new Error(extractApiError(uploadResult, "อัปโหลดสลิปไม่สำเร็จ"))
        }
      }

      clear()
      router.push("/dashboard/orders")
      router.refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เกิดข้อผิดพลาดที่ไม่คาดคิด")
    } finally {
      setSubmitting(false)
    }
  }

  if (!hydrated) {
    return (
      <div className="rounded-[2rem] border border-stone-200 bg-[#fffaf5] p-8 text-sm text-stone-500 shadow-sm">
        กำลังโหลดข้อมูล checkout...
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <section className="rounded-[2.25rem] border border-stone-200 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(255,247,237,0.86))] px-8 py-14 text-center shadow-[0_28px_70px_-42px_rgba(68,64,60,0.4)]">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Checkout</p>
        <h1 className="mb-3 font-serif text-3xl text-stone-900">ยังไม่มีรายการสำหรับชำระเงิน</h1>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-stone-600">
          กลับไปเลือกหลักสูตรก่อน แล้วค่อยกลับมาที่หน้านี้เพื่อแนบสลิปและส่งคำสั่งซื้อ
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปดูคอร์ส
        </Link>
      </section>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      data-testid="checkout-form"
      data-client-ready={clientReady ? "true" : "false"}
    >
      <section className="rounded-[2.25rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(255,241,235,0.9))] px-7 py-8 shadow-[0_28px_70px_-42px_rgba(68,64,60,0.38)] sm:px-9">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Secure Confirmation</p>
            <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">ยืนยันคำสั่งซื้อและแนบสลิป</h1>
            <p className="text-sm leading-7 text-stone-600">
              ระบบจะสร้างคำสั่งซื้อก่อน จากนั้นบันทึกสลิปโอนเงินเพื่อให้ผู้ดูแลอนุมัติการลงทะเบียนหลักสูตรให้อัตโนมัติ
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

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        <section className="space-y-6">
          <div className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_60px_-44px_rgba(41,37,36,0.38)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Payment Slip</p>
                <h2 className="mt-3 font-serif text-2xl text-stone-900">อัปโหลดหลักฐานการโอนเงิน</h2>
                <p className="mt-2 text-sm leading-7 text-stone-600">
                  รองรับไฟล์ JPG, PNG และ PDF ขนาดไม่เกิน 4.5MB เมื่อส่งคำสั่งซื้อแล้วรายการจะไปอยู่ที่แดชบอร์ดคำสั่งซื้อของคุณ
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                ระบบตรวจสอบก่อนอนุมัติ
              </div>
            </div>

            <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-stone-300 bg-[#fffaf5] px-6 py-12 text-center transition hover:border-stone-400 hover:bg-[#fff7f0]">
              <UploadCloud className="mb-4 h-10 w-10 text-stone-400" />
              <span className="mb-2 text-sm font-semibold text-stone-800">เลือกไฟล์สลิปเพื่อแนบกับคำสั่งซื้อ</span>
              <span className="text-xs leading-6 text-stone-500">รองรับภาพและ PDF สำหรับการตรวจสอบโดยแอดมิน</span>
              <input
                data-testid="slip-upload-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={(event) => setSlip(event.target.files?.[0] ?? null)}
              />
            </label>

            {slip && (
              <div className="mt-5 rounded-[1.6rem] border border-stone-200 bg-[#fffdf9] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-stone-900">{slip.name}</p>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                    พร้อมส่งแนบคำสั่งซื้อ
                  </span>
                </div>
                {previewUrl ? (
                  <img src={previewUrl} alt="Slip preview" className="mt-4 max-h-96 rounded-[1.35rem] object-contain" />
                ) : (
                  <div className="mt-4 rounded-[1.35rem] bg-stone-100 px-4 py-10 text-center text-sm text-stone-500">
                    ไฟล์ PDF พร้อมส่งแล้ว
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white/95 p-6 shadow-[0_24px_60px_-44px_rgba(41,37,36,0.34)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white">
                <ReceiptText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">สิ่งที่จะเกิดขึ้นหลังจากส่งคำสั่งซื้อ</h3>
                <p className="text-sm text-stone-600">ช่วยให้ผู้เรียนเข้าใจ flow ได้ชัดเจนก่อนกดยืนยัน</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.4rem] border border-stone-200 bg-[#fffaf5] px-4 py-4 text-sm text-stone-600">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Step 1</p>
                <p className="mt-2 leading-6">ระบบสร้างคำสั่งซื้อจากรายการคอร์สในตะกร้า</p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-[#fffaf5] px-4 py-4 text-sm text-stone-600">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Step 2</p>
                <p className="mt-2 leading-6">แอดมินตรวจสอบสลิปและอนุมัติคำสั่งซื้อ</p>
              </div>
              <div className="rounded-[1.4rem] border border-stone-200 bg-[#fffaf5] px-4 py-4 text-sm text-stone-600">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Step 3</p>
                <p className="mt-2 leading-6">คอร์สจะเข้าไปอยู่ในรายการเรียนของผู้ใช้โดยอัตโนมัติ</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-[1.6rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        <aside className="h-fit rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_24px_60px_-44px_rgba(41,37,36,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Order Recap</p>
          <h2 className="mt-3 font-serif text-2xl text-stone-900">สรุปคำสั่งซื้อ</h2>

          <div className="mt-6 space-y-3 border-b border-stone-200 pb-5">
            {items.map((item) => (
              <div key={item.courseId} className="flex items-start justify-between gap-3 text-sm">
                <span className="leading-6 text-stone-600">{item.title}</span>
                <span className="font-semibold text-stone-900">{formatPrice(item.price)}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-stone-600">ยอดรวมสุทธิ</span>
            <span className="text-lg font-semibold text-stone-900">{formatPrice(total)}</span>
          </div>

          <button
            data-testid="checkout-submit"
            type="submit"
            disabled={submitting || !hydrated}
            className="mt-7 w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
          >
            {submitting ? "กำลังส่งคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
          </button>

          <Link
            href="/cart"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-[#fff7f0]"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับไปแก้ไขตะกร้า
          </Link>
        </aside>
      </div>
    </form>
  )
}
