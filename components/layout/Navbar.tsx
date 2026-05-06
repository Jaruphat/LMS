"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Phone,
  PlusCircle,
  Shield,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react"
import { useState } from "react"
import { useCart } from "@/components/cart/CartProvider"

const NAV_LINKS = [
  { href: "/courses", label: "คอร์สเรียน" },
  { href: "/about", label: "เกี่ยวกับเรา" },
  { href: "/contact", label: "ติดต่อเรา" },
]

const ROLE_LABELS = {
  ADMIN: "ผู้ดูแลระบบ",
  STUDENT: "นักเรียน",
} as const

function navClass(active: boolean) {
  return active
    ? "rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700"
    : "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#fff3ef] hover:text-slate-950"
}

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { count, hydrated } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = session?.user?.email?.slice(0, 2).toUpperCase() ?? "?"

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100 bg-[#fefaf9]/90 backdrop-blur">
      <div className="border-b border-rose-100/80 bg-[#fff6f2] text-xs text-slate-600">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="hidden items-center gap-5 md:flex">
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-rose-600" />
              +66 81-234-5678
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3 text-rose-600" />
              info@learnhub.co.th
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-rose-700">
            <Sparkles className="h-3 w-3" />
            <span className="truncate">AI Automation Learning Studio</span>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {!session?.user ? (
              <>
                <Link href="/login" className="transition hover:text-rose-700">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="rounded-full bg-slate-950 px-3 py-1.5 font-semibold text-white transition hover:bg-slate-800">
                  สมัครสมาชิก
                </Link>
              </>
            ) : (
              <span className="max-w-[260px] truncate text-slate-500">{session.user.email}</span>
            )}
          </div>
        </div>
      </div>

      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/courses" className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.22em] text-rose-700">LearnHub</div>
            <div className="text-sm font-semibold text-slate-900">Thai Editorial LMS</div>
          </div>
        </Link>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-1 rounded-full border border-rose-100 bg-white/85 px-2 py-1 shadow-sm">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={navClass(pathname.startsWith(link.href))}>
                {link.label}
              </Link>
            ))}
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className={navClass(pathname.startsWith("/admin"))}>
                ผู้ดูแลระบบ
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session?.user?.role === "STUDENT" && (
            <Link
              href="/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-slate-600 shadow-sm transition hover:border-rose-200 hover:text-rose-700"
            >
              <ShoppingCart className="h-4 w-4" />
              {hydrated && count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          )}

          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="flex items-center gap-2 rounded-full border border-rose-100 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:border-rose-200"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff1ec] text-xs font-bold text-rose-700">
                  {initials}
                </div>
                <div className="hidden text-left md:block">
                  <p className="max-w-[160px] truncate text-sm font-semibold text-slate-900">{session.user.email}</p>
                  <p className="text-[11px] text-slate-500">{ROLE_LABELS[session.user.role]}</p>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 md:block" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-[0_30px_70px_-50px_rgba(17,24,39,0.35)]">
                    <div className="border-b border-rose-100 bg-[#fff8f6] px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-rose-700">บัญชีผู้ใช้</p>
                      <p className="mt-2 truncate text-sm font-semibold text-slate-900">{session.user.email}</p>
                      <span className="mt-2 inline-block rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                        {ROLE_LABELS[session.user.role]}
                      </span>
                    </div>

                    <div className="p-2">
                      {session.user.role === "STUDENT" && (
                        <>
                          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-[#fff3ef] hover:text-slate-900">
                            <LayoutDashboard className="h-4 w-4 text-rose-600" />
                            แดชบอร์ด
                          </Link>
                          <Link href="/dashboard/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-[#fff3ef] hover:text-slate-900">
                            <ShoppingCart className="h-4 w-4 text-rose-600" />
                            คำสั่งซื้อ
                          </Link>
                        </>
                      )}

                      {session.user.role === "ADMIN" && (
                        <>
                          <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-[#fff3ef] hover:text-slate-900">
                            <Shield className="h-4 w-4 text-rose-600" />
                            แดชบอร์ดผู้ดูแล
                          </Link>
                          <Link href="/admin/courses" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-[#fff3ef] hover:text-slate-900">
                            <BookOpen className="h-4 w-4 text-rose-600" />
                            จัดการคอร์ส
                          </Link>
                          <Link href="/admin/courses/new" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-[#fff3ef] hover:text-slate-900">
                            <PlusCircle className="h-4 w-4 text-rose-600" />
                            สร้างคอร์สใหม่
                          </Link>
                          <Link href="/admin/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-slate-600 transition hover:bg-[#fff3ef] hover:text-slate-900">
                            <ShoppingCart className="h-4 w-4 text-rose-600" />
                            จัดการคำสั่งซื้อ
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-rose-100 p-2">
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          signOut({ callbackUrl: "/login" })
                        }}
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        ออกจากระบบ
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-slate-950">
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500">
                สมัครสมาชิก
              </Link>
            </div>
          )}

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-100 bg-white text-slate-600 shadow-sm md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-rose-100 bg-[#fefaf9] px-4 py-4 md:hidden">
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fff3ef]"
              >
                {link.label}
              </Link>
            ))}

            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-[#fff3ef]"
              >
                ผู้ดูแลระบบ
              </Link>
            )}
          </div>

          {!session?.user && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl border border-rose-100 bg-white py-3 text-center text-sm font-medium text-slate-700"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl bg-rose-600 py-3 text-center text-sm font-semibold text-white"
              >
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
