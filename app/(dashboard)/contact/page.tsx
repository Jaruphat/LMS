import Link from "next/link"
import { Clock3, Mail, MapPin, Phone, Youtube } from "lucide-react"

const CHANNELS = [
  {
    title: "อีเมล",
    value: "support@learnhub.demo",
    href: "mailto:support@learnhub.demo",
    description: "เหมาะสำหรับสอบถามเรื่องคอร์ส, ขอเดโมระบบ และคุยต่อเรื่องการนำไปใช้งาน",
    icon: Mail,
  },
  {
    title: "YouTube",
    value: "@JaruphatJ",
    href: "https://www.youtube.com/@JaruphatJ",
    description: "ดูแนวทางและแรงบันดาลใจต้นทางของคอร์สสาย automation, OCR และงานปฏิบัติการที่ใช้ AI",
    icon: Youtube,
  },
  {
    title: "เวลาตอบกลับ",
    value: "จันทร์-ศุกร์ 10:00-18:00 น.",
    href: "/courses",
    description: "เหมาะสำหรับเริ่มดูภาพรวมหน้าคอร์สสาธารณะ ระบบสั่งซื้อ ระบบอนุมัติ และการจัดสิทธิ์เรียน",
    icon: Clock3,
  },
]

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.92fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">
              ติดต่อเรา
            </span>
            <h1 className="max-w-2xl text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              ติดต่อเราได้เลย หากอยากเปลี่ยนไอเดีย automation ให้กลายเป็นประสบการณ์การเรียนรู้ที่ใช้งานได้จริง
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              เดโมนี้โฟกัสที่ประสบการณ์เรียนรู้ฝั่งสาธารณะ ระบบสั่งซื้อ การลงทะเบียนแบบรออนุมัติ และการวางคอร์ส
              ให้พร้อมใช้งานจริง หากต้องการต่อยอดเพิ่มทั้งเนื้อหา การ deploy หรือเชื่อมระบบ production จุดนี้คือจุดเริ่มต้นที่ดี
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950 p-5 text-white">
                <div className="mb-3 flex items-center gap-2 text-amber-300">
                  <Phone className="h-4 w-4" />
                  ช่องทางสำหรับเดโม
                </div>
                <p className="text-sm leading-7 text-slate-300">
                  ตอนนี้สามารถใช้อีเมลหรือช่อง YouTube ต้นทางเป็นจุดติดต่อได้ก่อน หน้านี้ถูกออกแบบให้เป็นหน้าสาธารณะที่พร้อม
                  ใช้งาน แม้ยังไม่มีระบบรับฟอร์มฝั่ง backend เต็มรูปแบบ
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex items-center gap-2 text-slate-950">
                  <MapPin className="h-4 w-4" />
                  รูปแบบการให้บริการ
                </div>
                <p className="text-sm leading-7 text-slate-600">
                  ออกแบบสำหรับประสบการณ์เรียนออนไลน์ที่มีการตรวจชำระเงินด้วยคน การอนุมัติโดยแอดมิน และการจำกัดสิทธิ์
                  เข้าถึงเนื้อหา
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <h2 className="mb-4 text-2xl font-black text-slate-950">ช่องทางติดต่อ</h2>
            <div className="space-y-4">
              {CHANNELS.map(({ title, value, href, description, icon: Icon }) => (
                <a
                  key={title}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="block rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-950"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
                      <p className="text-lg font-bold text-slate-950">{value}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-slate-600">{description}</p>
                </a>
              ))}
            </div>

            <div className="mt-5 rounded-3xl bg-slate-950 p-5 text-white">
              <h3 className="text-lg font-bold">ขั้นตอนถัดไป</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                เริ่มจากดูหน้าคอร์สสาธารณะและ flow อนุมัติคำสั่งซื้อก่อน แล้วค่อยต่อยอดเป็นบทเรียนเพิ่ม ระบบ analytics
                และการเชื่อม integration เมื่อแนวทางเนื้อหานิ่งแล้ว
              </p>
              <Link
                href="/courses"
                className="mt-4 inline-flex rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
              >
                ดูรายการคอร์ส
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
