import { CheckCircle, XCircle } from "lucide-react"

interface Props {
  question: string
  result: {
    isCorrect: boolean
    correctAnswer: string
    selectedAnswer: string
    saved: boolean
  }
}

export function QuizResult({ question, result }: Props) {
  return (
    <div
      className={`rounded-[28px] border p-5 shadow-sm ${
        result.isCorrect
          ? "border-emerald-200 bg-emerald-50"
          : "border-rose-200 bg-rose-50"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        {result.isCorrect ? (
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
        )}
        <span
          className={`font-semibold text-sm ${
            result.isCorrect ? "text-emerald-700" : "text-rose-600"
          }`}
        >
          {result.isCorrect ? "ตอบถูก" : "ยังไม่ถูก"}
        </span>
      </div>

      <p className="mb-1 text-sm text-slate-600">{question}</p>

      {!result.isCorrect && (
        <p className="mt-2 text-sm text-slate-500">
          คำตอบที่ถูกคือ{" "}
          <span className="font-medium text-slate-800">{result.correctAnswer}</span>
        </p>
      )}

      {!result.saved && (
        <p className="mt-2 text-sm text-slate-500">
          ผลลัพธ์นี้แสดงให้ดูได้ทันที แต่ยังไม่ได้บันทึกลงระบบเพราะคุณยังไม่ได้เข้าสู่ระบบ
        </p>
      )}
    </div>
  )
}
