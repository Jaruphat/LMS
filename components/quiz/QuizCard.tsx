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
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="font-medium text-gray-800 mb-4 text-sm leading-relaxed">{quiz.question}</p>

      <div className="space-y-2 mb-4">
        {quiz.choices.map((choice) => (
          <button
            key={choice}
            onClick={() => setSelected(choice)}
            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
              selected === choice
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 font-medium"
                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            {choice}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        data-testid="quiz-submit"
        onClick={handleSubmit}
        disabled={!selected || loading}
        className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "กำลังส่งคำตอบ..." : "ส่งคำตอบ"}
      </button>
    </div>
  )
}
