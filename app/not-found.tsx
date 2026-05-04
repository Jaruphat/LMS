import Link from "next/link"
import { Compass, LifeBuoy } from "lucide-react"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 py-12">
        <section className="grid w-full gap-8 rounded-[36px] border border-slate-200 bg-white p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              404
            </span>
            <h1 className="text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              ไม่พบหน้าที่คุณต้องการ แต่เส้นทางเรียนรู้หลักยังอยู่ครบ
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              เส้นทางที่คุณเปิดยังไม่มีในเดโมนี้ ลองกลับไปที่หน้าคอร์ส หน้าข้อมูลสาธารณะ หรือหน้าติดต่อ เพื่อไปต่อได้ทันที
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Compass className="h-4 w-4" />
                ดูคอร์สทั้งหมด
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              >
                <LifeBuoy className="h-4 w-4" />
                ติดต่อทีมงาน
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.28),_transparent_38%),linear-gradient(135deg,#0f172a,#1d4ed8_55%,#22d3ee)] p-6 text-white">
            <div className="flex h-full flex-col justify-between rounded-[24px] border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-amber-200">แนะนำให้ไปต่อที่</p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/15 bg-black/10 p-4">
                    <p className="text-sm font-semibold">หน้ารวมคอร์ส</p>
                    <p className="mt-1 text-sm text-slate-200">ดูคอร์ส automation และ OCR ทั้ง 10 รายการที่ตั้งไว้สำหรับเดโม</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/10 p-4">
                    <p className="text-sm font-semibold">เกี่ยวกับสถาบัน</p>
                    <p className="mt-1 text-sm text-slate-200">ทำความเข้าใจแนวคิดและทิศทางของโปรดักต์เดโมนี้</p>
                  </div>
                  <div className="rounded-2xl border border-white/15 bg-black/10 p-4">
                    <p className="text-sm font-semibold">เส้นทางการสั่งซื้อ</p>
                    <p className="mt-1 text-sm text-slate-200">ล็อกอิน เพิ่มคอร์สลงตะกร้า อัปโหลดสลิป และรออนุมัติการเข้าเรียน</p>
                  </div>
                </div>
              </div>
              <p className="mt-8 text-sm text-slate-200">ถ้าคุณมาถึงหน้านี้จากลิงก์ที่ผิด ตอนนี้ระบบ fallback ถูกวางไว้เรียบร้อยแล้ว</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
