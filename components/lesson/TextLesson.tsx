"use client"
import ReactMarkdown from "react-markdown"

export function TextLesson({ content }: { content: string }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-rose-100 bg-[#fffdfc] shadow-sm">
      <div className="border-b border-rose-100 bg-[#fff3ef] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
        บทความและโน้ตประกอบบทเรียน
      </div>
      <div className="p-6 lg:p-8">
        <div className="prose prose-sm max-w-none prose-headings:text-slate-950 prose-p:leading-8 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-950">
        <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
