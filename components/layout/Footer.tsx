import Link from "next/link"
import { ArrowRight, BookOpen, Mail, MapPin, Phone } from "lucide-react"

const COURSE_LINKS = ["Automation Workflow", "OCR ภาษาไทย", "Google Sheets + AI", "TypeScript Workshop", "Q&A กับผู้สอน"]
const QUICK_LINKS = [
  { href: "/courses", label: "คอร์สทั้งหมด" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/contact", label: "ติดต่อเรา" },
  { href: "/login", label: "เข้าสู่ระบบ" },
  { href: "/register", label: "สมัครสมาชิก" },
]

export function Footer() {
  return (
    <footer className="border-t border-rose-100 bg-[#fff8f4]">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-10 rounded-[32px] border border-rose-100 bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-rose-700">LearnHub LMS</p>
              <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950">
                แพลตฟอร์มเรียนออนไลน์ที่ออกแบบให้คอร์ส, preview, commerce และถาม-ตอบกับผู้สอนอยู่ใน flow เดียวกัน
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                เหมาะกับการเปิดคอร์สสาย automation, AI workflow, OCR และระบบฝึกทักษะแบบลงมือทำจริง พร้อมรองรับการเรียนแบบ preview
                ก่อนตัดสินใจซื้อและมีพื้นที่ถาม-ตอบในแต่ละบทเรียน
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                สำรวจคอร์สทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-[#fff8f6] px-5 py-4 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
              >
                คุยเรื่องเปิดคอร์ส
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
          <div>
            <Link href="/courses" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-700">LearnHub</p>
                <p className="text-sm font-semibold text-slate-900">Editorial Learning Platform</p>
              </div>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
              ใช้เป็นฐานสำหรับ LMS ภาษาไทยที่ต้องการทั้งระบบสมาชิก, บทเรียนวิดีโอ, webboard, chatbot และ flow การขายคอร์สในที่เดียว
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900">เมนูหลัก</h3>
            <ul className="mt-4 space-y-3">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-600 transition hover:text-rose-700">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900">ธีมคอร์ส</h3>
            <ul className="mt-4 space-y-3">
              {COURSE_LINKS.map((cat) => (
                <li key={cat} className="text-sm text-slate-600">
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900">ติดต่อ</h3>
            <ul className="mt-4 space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                123 ถ.สุขุมวิท กรุงเทพฯ 10110
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="h-4 w-4 shrink-0 text-rose-600" />
                +66 81-234-5678
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="h-4 w-4 shrink-0 text-rose-600" />
                info@learnhub.co.th
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-rose-100">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-slate-500 md:flex-row">
          <p>© 2026 LearnHub. สงวนลิขสิทธิ์</p>
          <div className="flex gap-5">
            <Link href="#" className="transition hover:text-rose-700">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="#" className="transition hover:text-rose-700">
              เงื่อนไขการใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
