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
      className={`rounded-xl border p-5 ${
        result.isCorrect
          ? "border-green-200 bg-green-50"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {result.isCorrect ? (
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
        )}
        <span
          className={`font-semibold text-sm ${
            result.isCorrect ? "text-green-700" : "text-red-600"
          }`}
        >
          {result.isCorrect ? "ตอบถูก" : "ยังไม่ถูก"}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-1">{question}</p>

      {!result.isCorrect && (
        <p className="text-sm text-gray-500 mt-2">
          คำตอบที่ถูกคือ{" "}
          <span className="font-medium text-gray-800">{result.correctAnswer}</span>
        </p>
      )}

      {!result.saved && (
        <p className="mt-2 text-sm text-gray-500">
          ผลลัพธ์นี้แสดงให้ดูได้ทันที แต่ยังไม่ได้บันทึกลงระบบเพราะคุณยังไม่ได้เข้าสู่ระบบ
        </p>
      )}
    </div>
  )
}
