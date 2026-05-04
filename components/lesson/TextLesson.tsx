"use client"
import ReactMarkdown from "react-markdown"

export function TextLesson({ content }: { content: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="prose prose-gray prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
