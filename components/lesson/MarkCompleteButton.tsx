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
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
        done
          ? "bg-green-50 text-green-700 border border-green-200 cursor-default"
          : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
      } disabled:opacity-70`}
    >
      <CheckCircle className="w-4 h-4" />
      {done ? "Completed" : loading ? "Saving…" : "Mark as Complete"}
    </button>
  )
}
