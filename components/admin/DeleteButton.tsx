"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface Props {
  apiPath: string
  label: string
  confirmMessage: string
  redirectTo: string
  variant?: "danger" | "ghost"
}

export function DeleteButton({
  apiPath,
  label,
  confirmMessage,
  redirectTo,
  variant = "danger",
}: Props) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return

    setError("")

    const response = await fetch(apiPath, { method: "DELETE" })
    const result = response.headers.get("content-type")?.includes("application/json")
      ? await response.json()
      : null

    if (!response.ok) {
      setError(result?.error ?? "ลบรายการไม่สำเร็จ")
      return
    }

    startTransition(() => {
      router.push(redirectTo)
      router.refresh()
    })
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
          variant === "danger"
            ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            : "border border-rose-100 bg-white text-slate-700 hover:bg-[#fff8f6]"
        }`}
      >
        {isPending ? "กำลังลบ..." : label}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
