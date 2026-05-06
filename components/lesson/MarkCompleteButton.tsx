"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

interface Props {
  lessonId: string
  completed: boolean
}

export function MarkCompleteButton({ lessonId, completed }: Props) {
  const router = useRouter()
  const [done, setDone] = useState(completed)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (done || loading) return
    setLoading(true)
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    })
    setDone(true)
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={done || loading}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
        done
          ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
          : "bg-rose-600 text-white shadow-sm hover:bg-rose-500"
      } disabled:opacity-70`}
    >
      <CheckCircle className="w-4 h-4" />
      {done ? "เรียนจบบทนี้แล้ว" : loading ? "กำลังบันทึก..." : "ทำเครื่องหมายว่าเรียนจบ"}
    </button>
  )
}
