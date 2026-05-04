/* eslint-disable @next/next/no-img-element */
"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, UploadCloud } from "lucide-react"
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
    return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">กำลังโหลดข้อมูล checkout...</div>
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-14 text-center">
        <h1 className="mb-2 text-2xl font-bold text-slate-900">ยังไม่มีรายการสำหรับชำระเงิน</h1>
        <p className="mb-6 text-sm text-slate-500">กลับไปเลือกคอร์สก่อน แล้วค่อยกลับมาส่งสลิป</p>
        <Link
          href="/courses"
          className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700"
        >
          กลับไปดูคอร์ส
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      data-testid="checkout-form"
      data-client-ready={clientReady ? "true" : "false"}
    >
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h1 className="mb-3 text-2xl font-bold text-slate-900">ชำระเงิน</h1>
          <p className="text-sm text-slate-500">
            ระบบจะสร้างคำสั่งซื้อก่อน แล้วอัปโหลดสลิปเพื่อรอแอดมินอนุมัติการลงทะเบียนคอร์ส
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">อัปโหลดสลิป</h2>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center hover:border-indigo-300 hover:bg-indigo-50/30">
            <UploadCloud className="mb-3 h-9 w-9 text-slate-400" />
            <span className="mb-1 text-sm font-medium text-slate-700">เลือกไฟล์ JPG, PNG หรือ PDF ไม่เกิน 4.5MB</span>
            <span className="text-xs text-slate-500">แนบสลิปครั้งเดียวพร้อมคำสั่งซื้อ</span>
            <input
              data-testid="slip-upload-input"
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(event) => setSlip(event.target.files?.[0] ?? null)}
            />
          </label>

          {slip && (
            <div className="mt-4 rounded-2xl border border-slate-200 p-4">
              <p className="mb-3 text-sm font-medium text-slate-800">{slip.name}</p>
              {previewUrl ? (
                <img src={previewUrl} alt="Slip preview" className="max-h-80 rounded-xl object-contain" />
              ) : (
                <div className="rounded-xl bg-slate-100 px-4 py-8 text-center text-sm text-slate-500">
                  ไฟล์ PDF พร้อมส่งแล้ว
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </section>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">สรุปคำสั่งซื้อ</h2>
        <div className="space-y-3 border-b border-slate-100 pb-4">
          {items.map((item) => (
            <div key={item.courseId} className="flex items-start justify-between gap-3 text-sm">
              <span className="text-slate-600">{item.title}</span>
              <span className="font-medium text-slate-900">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-600">ยอดรวมสุทธิ</span>
          <span className="text-lg font-bold text-slate-900">{formatPrice(total)}</span>
        </div>
        <button
          data-testid="checkout-submit"
          type="submit"
          disabled={submitting || !hydrated}
          className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {submitting ? "กำลังส่งคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
        </button>
      </aside>
    </form>
  )
}
