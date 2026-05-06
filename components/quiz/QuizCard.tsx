"use client"
import { useState } from "react"
import { QuizResult } from "./QuizResult"
import { extractApiError, readApiPayload } from "@/lib/readApiPayload"

interface Quiz {
  id: string
  question: string
  choices: string[]
}

interface Result {
  isCorrect: boolean
  correctAnswer: string
  selectedAnswer: string
  saved: boolean
}

export function QuizCard({ quiz }: { quiz: Quiz }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!selected || loading) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quiz.id, selectedAnswer: selected }),
      })
      const data = await readApiPayload(res)

      if (!res.ok) {
        setError(extractApiError(data, "ไม่สามารถส่งคำตอบได้"))
        return
      }

      if (!data || typeof data !== "object" || !("isCorrect" in data) || !("correctAnswer" in data)) {
        setError("ระบบตอบกลับไม่สมบูรณ์ กรุณาลองใหม่อีกครั้ง")
        return
      }

      setResult({
        isCorrect: Boolean(data.isCorrect),
        correctAnswer: typeof data.correctAnswer === "string" ? data.correctAnswer : "",
        selectedAnswer: selected,
        saved: "saved" in data ? Boolean(data.saved) : true,
      })
    } catch {
      setError("เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return <QuizResult result={result} question={quiz.question} />
  }

  return (
    <div className="rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm">
      <p className="mb-4 text-sm font-medium leading-7 text-slate-800">{quiz.question}</p>

      <div className="mb-4 space-y-2">
        {quiz.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => setSelected(choice)}
            className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
              selected === choice
                ? "border-rose-300 bg-rose-50 text-rose-700 font-medium"
                : "border-rose-100 text-slate-700 hover:border-rose-200 hover:bg-[#fff8f6]"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        data-testid="quiz-submit"
        onClick={handleSubmit}
        disabled={!selected || loading}
        className="w-full rounded-full bg-slate-950 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? "กำลังส่งคำตอบ..." : "ส่งคำตอบ"}
      </button>
    </div>
  )
}
