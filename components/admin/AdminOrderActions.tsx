"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useClientReady } from "@/lib/useClientReady"

interface Props {
  orderId: string
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export function AdminOrderActions({ orderId, status }: Props) {
  const router = useRouter()
  const clientReady = useClientReady()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  async function submit(action: "approve" | "reject") {
    setError("")

    const response = await fetch(`/api/admin/orders/${orderId}/${action}`, {
      method: "POST",
    })

    const result = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : null

    if (!response.ok) {
      setError(result?.error ?? "อัปเดตสถานะไม่สำเร็จ")
      return
    }

    startTransition(() => {
      router.refresh()
    })
  }

  if (status !== "PENDING") {
    return null
  }

  return (
    <div className="space-y-2" data-testid="admin-order-actions" data-client-ready={clientReady ? "true" : "false"}>
      <div className="flex flex-wrap gap-2">
        <button
          data-testid="approve-order-button"
          type="button"
          onClick={() => submit("approve")}
          disabled={isPending}
          className="rounded-full bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          อนุมัติ
        </button>
        <button
          data-testid="reject-order-button"
          type="button"
          onClick={() => submit("reject")}
          disabled={isPending}
          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
        >
          ปฏิเสธ
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
