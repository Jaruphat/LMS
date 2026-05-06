import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Bot, FileSearch, Layers3, MessageSquare, PlayCircle, Workflow } from "lucide-react"
import { CourseCard } from "@/components/course/CourseCard"
import { getPublicCourses } from "@/lib/data"
import { formatPrice } from "@/lib/format"

const TOPICS = [
  "ระบบงานอัตโนมัติด้วย n8n",
  "Google Sheets + AI Workflow",
  "OCR ภาษาไทย",
  "Q&A ระหว่างผู้สอนกับผู้เรียน",
  "การเรียนแบบ preview ก่อนตัดสินใจ",
]

const TRACKS = [
  {
    title: "Automation ที่ใช้กับงานจริง",
    description: "เรียนรู้ตั้งแต่การวาง trigger ไปจนถึงการส่งมอบ workflow ให้ทีมใช้งานต่อได้จริงในองค์กร",
    icon: Workflow,
  },
  {
    title: "แปลงข้อมูลยุ่งยากให้พร้อมใช้งาน",
    description: "ต่อยอดงาน OCR, เอกสาร, สลิป และข้อมูลกึ่งโครงสร้างให้กลายเป็น flow ที่ตรวจสอบย้อนหลังได้",
    icon: FileSearch,
  },
  {
    title: "เรียนจากโจทย์ที่ใกล้กับ production",
    description: "ทั้งคอร์สฟรี คอร์สเสียเงิน preview บทเรียน และ approval flow ถูกต่อเข้าระบบเดียวกันครบแล้ว",
    icon: Bot,
  },
]

const FEATURES = [
  {
    title: "หน้าคอร์สแบบดูภาพรวมได้เร็ว",
    description: "จัดวางคอร์สเป็น editorial catalog ที่เปิดดูจำนวนบทเรียน ราคา และความเข้มข้นของคอร์สได้ในสายตาเดียว",
    icon: Layers3,
  },
  {
    title: "Preview วิดีโอก่อนซื้อ",
    description: "คอร์สที่มีวิดีโอสามารถโชว์ preview card ของแต่ละบทได้ชัดกว่าเดิม ไม่ต้องเดาจากไอคอนเล็ก ๆ",
    icon: PlayCircle,
  },
  {
    title: "ถามตอบกับผู้สอนได้ในคอร์ส",
    description: "มี webboard/Q&A ต่อกับสิทธิ์คอร์สโดยตรง เหมาะกับการถามปัญหาและตามคำตอบจากผู้สอน",
    icon: MessageSquare,
  },
]

export default async function CoursesPage() {
  const courses = await getPublicCourses()
  const totalLessons = courses.reduce((sum, course) => sum + course._count.lessons, 0)
  const featuredCourse = courses[0]

  return (
    <div className="-mt-8 bg-[#fdf7f4] pb-12">
      <section className="mx-auto max-w-7xl px-4 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
                Editorial Catalog
              </span>
              <h1 className="max-w-4xl text-4xl font-black leading-tight text-slate-950 md:text-6xl">
                แค็ตตาล็อกคอร์สสาย AI และ Automation ที่ออกแบบให้ดูภาพรวมแล้วตัดสินใจเรียนต่อได้ง่ายขึ้น
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                หน้านี้ถูกปรับใหม่ตาม design handoff ให้มี mood แบบ warm editorial มากขึ้น เน้นการอ่านคอร์สเป็นชุดความสามารถ
                ไม่ใช่แค่รายการสินค้า และยังเชื่อมกับระบบ preview, order, approval และ webboard ที่ใช้งานได้จริงอยู่เดิม
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <span key={topic} className="rounded-full border border-rose-100 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  {topic}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                ดูคอร์สทั้งหมด
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700"
              >
                อ่านแนวคิดของแพลตฟอร์ม
              </Link>
            </div>
          </div>

          <div className="rounded-[36px] border border-rose-100 bg-white p-4 shadow-[0_30px_80px_-55px_rgba(17,24,39,0.35)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#f7ece9]">
              <Image
                src="/images/generated/hero-automation-banner.png"
                alt="ภาพแบนเนอร์คอร์สระบบอัตโนมัติ"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_22%,rgba(15,23,42,0.62)_100%)]" />
              <div className="absolute inset-x-5 bottom-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/20 bg-white/14 px-4 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/70">คอร์สที่ publish แล้ว</p>
                  <p className="mt-2 text-3xl font-black text-white">{courses.length}</p>
                </div>
                <div className="rounded-3xl border border-white/20 bg-white/14 px-4 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/70">จำนวนบทเรียน</p>
                  <p className="mt-2 text-3xl font-black text-white">{totalLessons}</p>
                </div>
              </div>
            </div>

            {featuredCourse ? (
              <div className="mt-4 rounded-[28px] border border-rose-100 bg-[#fff8f6] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">Featured Course</p>
                    <h2 className="mt-2 text-xl font-black text-slate-950">{featuredCourse.title}</h2>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    {featuredCourse.price === 0 ? "เรียนฟรี" : formatPrice(featuredCourse.price)}
                  </span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{featuredCourse.description}</p>
                <Link
                  href={`/courses/${featuredCourse.id}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-700 transition hover:text-rose-600"
                >
                  เปิดหน้าหลักสูตรนี้
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4">
        <div className="grid gap-4 lg:grid-cols-3">
          {TRACKS.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-7xl px-4">
        <div className="rounded-[36px] border border-rose-100 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
                สิ่งที่ปรับจากดีไซน์ใหม่
              </span>
              <h2 className="mt-3 text-3xl font-black text-slate-950">โครงหน้าคอร์สใหม่ยังยึด flow จริงของระบบเดิม</h2>
              <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
                แม้หน้าตาจะ editorial มากขึ้น แต่ทุกคอร์สยังเชื่อมกับระบบสมาชิก, checkout, upload slip, อนุมัติคำสั่งซื้อ,
                preview บทเรียน, chatbot และ Q&A ตามของจริงในโปรเจกต์นี้
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-[28px] bg-[#fff8f6] p-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="catalog" className="mx-auto mt-10 max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              Course Catalog
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-950">{courses.length} หลักสูตรที่เปิดดูและซื้อเรียนต่อได้แล้ว</h2>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
              ใช้หน้ารายการนี้เพื่อสำรวจภาพรวม แล้วเข้าไปดู detail ของแต่ละคอร์สเพื่อดู video preview, curriculum, rating และ
              ถามตอบกับผู้สอนในแต่ละหลักสูตร
            </p>
          </div>
          <div className="rounded-full border border-rose-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
            พร้อมใช้งาน {courses.length} คอร์ส
          </div>
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
