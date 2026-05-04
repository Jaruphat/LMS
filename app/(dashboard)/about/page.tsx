import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bot, FileText, MessageSquare, Sparkles, Workflow } from "lucide-react"

const PILLARS = [
  {
    title: "สร้าง workflow ที่เอาไปใช้ได้จริง",
    description: "ทุกคอร์สถูกวางอยู่บนระบบงานอัตโนมัติที่คุณสามารถออกแบบ ทดสอบ ปล่อยใช้งาน และดูแลต่อได้จริง",
    icon: Workflow,
  },
  {
    title: "ทำให้ AI อยู่บนงานปฏิบัติการจริง",
    description: "เราเน้น AI ที่ใช้งานได้จริงบน structured inputs, review loops และ handoff ที่ปลอดภัยสำหรับทีม",
    icon: Bot,
  },
  {
    title: "เปลี่ยนเอกสารให้เป็นข้อมูล",
    description: "บทเรียนด้าน OCR และ parsing จะเน้นเรื่องคุณภาพ การตรวจสอบย้อนหลัง และการนำข้อมูลไปใช้งานต่อ",
    icon: FileText,
  },
  {
    title: "ต่อยอดประสบการณ์แชตบอท",
    description: "workflow แบบ LINE assistant ครอบคลุมทั้ง retrieval, escalation และ use case งาน support ที่ใช้ได้จริง",
    icon: MessageSquare,
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-12">
      <section className="grid gap-8 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1.05fr_0.95fr] lg:p-10">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            <Sparkles className="h-3.5 w-3.5" />
            เกี่ยวกับ LearnHub
          </span>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              LMS เดโมที่ออกแบบรอบงาน Automation, OCR และการใช้ AI Workflow แบบลงมือทำจริง
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              ประสบการณ์นี้ถูกออกแบบให้เหมือนสถาบันเรียนออนไลน์สำหรับคนทำระบบ คนสร้างโปรดักต์ และครีเอเตอร์ที่อยาก
              เปลี่ยนไอเดีย automation ให้กลายเป็นระบบที่ไว้ใจได้ โดยแค็ตตาล็อกปัจจุบันตั้งใจปั้นจากหัวข้อที่ลงมือทำได้จริง
              เช่น n8n, Google Sheets orchestration, OCR ภาษาไทย, ผู้ช่วยบน LINE และระบบคอนเทนต์อัตโนมัติ
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-3xl font-black">10</p>
              <p className="mt-2 text-sm text-slate-300">คอร์สในแค็ตตาล็อกเดโมชุดปัจจุบัน</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-3xl font-black text-slate-950">3</p>
              <p className="mt-2 text-sm text-slate-600">แกนหลัก 3 ด้าน: automation systems, OCR pipelines และ AI ops</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
            >
              ดูคอร์สทั้งหมด
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://www.youtube.com/@JaruphatJ"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
            >
              ดูช่องต้นทางแรงบันดาลใจ
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
          <Image
            src="/images/generated/course-showcase-mockup.png"
            alt="ภาพจำลองหน้าคอร์ส"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 48vw"
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-3xl font-black text-slate-950">โครงสร้างของสถาบันเดโมนี้ถูกวางอย่างไร</h2>
          <p className="text-base leading-8 text-slate-600">
            แทนที่จะเป็นลิสต์คอร์สแบบกว้าง ๆ ทั่วไป ทิศทางของโปรดักต์นี้ถูกสร้างรอบระบบที่คนทำงานสามารถหยิบไปใช้ได้จริง
            เช่น การเก็บข้อมูล การตรวจผล OCR การ route คำตอบจาก AI และการทำ content pipeline ให้ใช้งานแบบปฏิบัติการได้
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PILLARS.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-amber-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-3 text-lg font-bold text-slate-950">{title}</h3>
              <p className="text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
