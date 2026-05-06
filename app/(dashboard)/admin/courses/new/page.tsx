import Link from "next/link"
import { ChevronLeft, Sparkles } from "lucide-react"
import { CourseForm } from "@/components/course/CourseForm"

export default function NewCoursePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 transition hover:text-stone-900"
      >
        <ChevronLeft className="h-4 w-4" />
        กลับไปหน้าจัดการคอร์ส
      </Link>

      <section className="rounded-[2.25rem] border border-stone-200 bg-[linear-gradient(135deg,rgba(255,251,245,0.96),rgba(255,241,235,0.9))] px-7 py-8 shadow-[0_28px_70px_-42px_rgba(68,64,60,0.38)] sm:px-9">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Course Builder</p>
          <h1 className="font-serif text-3xl text-stone-900 sm:text-4xl">สร้างหลักสูตรใหม่</h1>
          <p className="text-sm leading-7 text-stone-600">
            เริ่มจากชื่อคอร์ส คำอธิบาย ราคา และภาพปก ก่อนจะค่อยเพิ่มบทเรียน วิดีโอ preview และองค์ประกอบเชิงพาณิชย์ในขั้นถัดไป
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.7fr]">
        <div className="min-w-0">
          <CourseForm mode="create" />
        </div>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-stone-200 bg-[#fffdf9] p-6 shadow-[0_24px_60px_-46px_rgba(41,37,36,0.3)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-900 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-stone-900">แนวทางที่แนะนำ</h2>
                <p className="text-sm text-stone-600">ช่วยให้คอร์สดูพร้อมขายตั้งแต่หน้าแรก</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-7 text-stone-600">
              <p>ตั้งชื่อคอร์สให้เห็นผลลัพธ์การเรียนรู้ชัดเจน เช่น “สร้างระบบอัตโนมัติด้วย n8n สำหรับธุรกิจจริง”</p>
              <p>อธิบายว่าผู้เรียนจะได้อะไร และคอร์สนี้เหมาะกับใคร เพื่อให้หน้า catalog ตัดสินใจซื้อได้ง่าย</p>
              <p>ถ้ายังไม่พร้อมเปิดขาย ให้บันทึกเป็นแบบร่างก่อน แล้วค่อยกลับมาเผยแพร่หลังเติมบทเรียนครบ</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
