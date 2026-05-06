"use client"

import { startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useCart } from "@/components/cart/CartProvider"
import { useClientReady } from "@/lib/useClientReady"

interface Props {
  course: {
    id: string
    title: string
    price: number
    thumbnailUrl?: string | null
  }
  callbackPath: string
  isEnrolled: boolean
  hasPendingOrder: boolean
}

export function AddToCartButton({ course, callbackPath, isEnrolled, hasPendingOrder }: Props) {
  const router = useRouter()
  const clientReady = useClientReady()
  const { data: session } = useSession()
  const { addItem, hasItem } = useCart()
  const [added, setAdded] = useState(false)

  const inCart = hasItem(course.id)

  function handleClick() {
    if (isEnrolled || hasPendingOrder) return

    if (!session?.user) {
      startTransition(() => {
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`)
      })
      return
    }

    if (inCart) {
      startTransition(() => {
        router.push("/cart")
      })
      return
    }

    addItem({
      courseId: course.id,
      title: course.title,
      price: course.price,
      thumbnailUrl: course.thumbnailUrl ?? null,
    })
    setAdded(true)
  }

  if (isEnrolled) {
    return (
      <button
        data-testid="course-enrolled-button"
        data-client-ready={clientReady ? "true" : "false"}
        type="button"
        disabled
        className="w-full rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
      >
        ลงทะเบียนแล้ว
      </button>
    )
  }

  if (hasPendingOrder) {
    return (
      <button
        data-testid="course-pending-button"
        data-client-ready={clientReady ? "true" : "false"}
        type="button"
        disabled
        className="w-full rounded-full border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700"
      >
        รอแอดมินตรวจสอบการชำระเงิน
      </button>
    )
  }

  return (
    <button
      data-testid="add-to-cart-button"
      data-client-ready={clientReady ? "true" : "false"}
      type="button"
      onClick={handleClick}
      className={`w-full rounded-full px-4 py-3 text-sm font-medium transition-colors ${
        inCart || added
          ? "bg-slate-900 text-white hover:bg-slate-800"
          : "bg-rose-600 text-white hover:bg-rose-500"
      }`}
    >
      {inCart || added ? "ไปที่ตะกร้า" : "เพิ่มลงตะกร้า"}
    </button>
  )
}
