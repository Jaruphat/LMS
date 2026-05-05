import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bot, Database, FileSearch, MessageSquare, Workflow } from "lucide-react"
import { CourseCard } from "@/components/course/CourseCard"
import { getPublicCourses } from "@/lib/data"

const TOPICS = [
  "ระบบงานอัตโนมัติด้วย n8n",
  "Automation จาก Google Sheets",
  "OCR ภาษาไทย",
  "ผู้ช่วยอัจฉริยะบน LINE",
  "งานคอนเทนต์ด้วย AI",
]

const TRACKS = [
  {
    title: "ระบบอัตโนมัติที่นำไปใช้ได้จริง",
    description: "ออกแบบตั้งแต่ trigger, orchestration, retry, approval ไปจนถึงการส่งมอบงานให้ทีมใช้งานต่อได้จริง",
    icon: Workflow,
  },
  {
    title: "OCR และข้อมูลแบบมีโครงสร้าง",
    description: "เปลี่ยนเอกสารไทย สลิป และฟอร์ม ให้กลายเป็นข้อมูลที่ตรวจสอบย้อนกลับและ validate ได้",
    icon: FileSearch,
  },
  {
    title: "AI สำหรับงานปฏิบัติการ",
    description: "ทำให้ agent และ content workflow ทำงานบนข้อมูลจริง กฎการ routing และสถานะที่ชัดเจน",
    icon: Bot,
  },
]

const FEATURES = [
  {
    title: "แค็ตตาล็อกคอร์สจากโจทย์ใช้งานจริง",
    description: "ชุดคอร์สเดโมนี้ออกแบบจากธีม automation สาธารณะที่เชื่อมโยงกับช่องอ้างอิง เพื่อให้เริ่มทดลองระบบได้ทันที",
    icon: MessageSquare,
  },
  {
    title: "สิทธิ์เรียนแบบตรวจสอบได้",
    description: "รองรับ cart, checkout, อัปโหลดสลิป, รีวิวโดยแอดมิน และสร้างสิทธิ์เรียนอัตโนมัติหลังอนุมัติ",
    icon: Database,
  },
]

export default async function CoursesPage() {
  const courses = await getPublicCourses()
  const totalLessons = courses.reduce((sum, course) => sum + course._count.lessons, 0)

  return (
    <div className="-mt-8 space-y-10 pb-8">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <Image
            src="/images/generated/hero-automation-banner.png"
            alt="ภาพแบนเนอร์คอร์สระบบอัตโนมัติ"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.92),rgba(2,6,23,0.76)_40%,rgba(2,6,23,0.4)_72%,rgba(2,6,23,0.18))]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              แค็ตตาล็อกคอร์สสายอัตโนมัติ
            </span>
            <div className="space-y-4">
              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">
                เรียนรู้ workflow เบื้องหลัง AI Ops, OCR Pipeline และระบบ Automation ที่ต่อยอดใช้งานได้จริง
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-200 md:text-lg">
                หน้านี้ออกแบบสำหรับคนทำงานที่อยากเปลี่ยนจากการใช้เครื่องมือแบบกระจัดกระจาย ไปสู่ระบบที่ชัดเจนสำหรับ
                Google Sheets, n8n orchestration, ผู้ช่วยสไตล์ LINE, การดึงข้อมูลจากเอกสาร และงานคอนเทนต์ด้วย AI
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm"
                >
                  {topic}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300"
              >
                ดูคอร์สทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                แนวคิดของแค็ตตาล็อกนี้
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:self-stretch">
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-200">คอร์สที่เปิดขายแล้ว</p>
              <p className="mt-3 text-4xl font-black text-white">{courses.length}</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">ชุดคอร์สเริ่มต้นที่คัดมาจากธีม automation ที่ใช้ได้จริง</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-amber-200">จำนวนบทเรียน</p>
              <p className="mt-3 text-4xl font-black text-white">{totalLessons}</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">มีทั้งบทเรียน preview และเนื้อหาที่ปลดล็อกหลังอนุมัติคำสั่งซื้อ</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
              เส้นทางการเรียนรู้
            </span>
            <h2 className="text-3xl font-black text-slate-950">แค็ตตาล็อกที่ออกแบบเหมือน skill stack ของคนทำระบบยุคใหม่</h2>
            <p className="text-base leading-8 text-slate-600">
              แทนที่จะใช้หมวดกว้าง ๆ แบบทั่วไป หน้านี้โฟกัสที่ระบบคิดเชิงงานจริง แต่ละ track ผูกกับรูปแบบงานที่ทีมต้อง
              automate, review และนำไปรันใน production ได้จริง
            </p>
          </div>

          <div className="grid gap-4">
            {TRACKS.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-amber-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-[16/11]">
            <Image
              src="/images/generated/course-showcase-mockup.png"
              alt="ภาพจำลองหน้าคอร์สและระบบเรียน"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 48vw"
            />
          </div>
          <div className="grid gap-4 border-t border-slate-200 p-6 lg:grid-cols-2">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-3xl bg-slate-50 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
              รายการคอร์ส
            </span>
            <h2 className="text-3xl font-black text-slate-950">{courses.length} คอร์สพร้อมใช้งานกับ flow ซื้อคอร์ส ชำระเงิน และอนุมัติคำสั่งซื้อ</h2>
            <p className="max-w-3xl text-base leading-8 text-slate-600">
              คอร์สทั้งหมดถูก publish และเชื่อมเข้ากับ commerce flow ปัจจุบันแล้ว ทั้ง cart, checkout, อัปโหลดสลิป,
              การอนุมัติโดยแอดมิน และการสร้างสิทธิ์เรียนหลังอนุมัติ
            </p>
          </div>
          <p className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
            เปิดใช้งานแล้ว {courses.length} คอร์ส
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  )
}
