import Link from "next/link"
import { BookOpen, Mail, Phone, MapPin, Facebook, Youtube, Instagram } from "lucide-react"

const COURSE_LINKS = ["งานเขียนโค้ด", "งานออกแบบ", "งานข้อมูล", "งานธุรกิจ", "งานคอนเทนต์"]
const QUICK_LINKS = [
  { href: "/courses", label: "คอร์สทั้งหมด" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/contact", label: "ติดต่อเรา" },
  { href: "/login", label: "เข้าสู่ระบบ" },
  { href: "/register", label: "สมัครสมาชิก" },
]

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link href="/courses" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <span className="font-bold text-white text-lg leading-none">Learn</span>
                <span className="font-bold text-amber-400 text-lg leading-none">Hub</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              แพลตฟอร์มการเรียนรู้ออนไลน์ที่มีคุณภาพ
              ออกแบบโดยผู้เชี่ยวชาญเพื่อพัฒนาทักษะของคุณ
            </p>
            <div className="flex gap-3">
              {[Facebook, Youtube, Instagram].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full bg-slate-800 hover:bg-amber-400 hover:text-slate-900 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">เมนูหลัก</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-slate-400 text-sm hover:text-amber-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Categories */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">หมวดหมู่</h4>
            <ul className="space-y-2.5">
              {COURSE_LINKS.map((cat) => (
                <li key={cat}>
                  <Link href="/courses" className="text-slate-400 text-sm hover:text-amber-400 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">ติดต่อเรา</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                123 ถ.สุขุมวิท กรุงเทพฯ 10110
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                +66 81-234-5678
              </li>
              <li className="flex items-center gap-2.5 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                info@learnhub.co.th
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-slate-500 text-xs">
            © 2026 LearnHub. สงวนลิขสิทธิ์
          </p>
          <div className="flex gap-5 text-xs text-slate-500">
            <Link href="#" className="hover:text-amber-400 transition-colors">นโยบายความเป็นส่วนตัว</Link>
            <Link href="#" className="hover:text-amber-400 transition-colors">เงื่อนไขการใช้งาน</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
