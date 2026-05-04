"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  BookOpen, ChevronDown, LayoutDashboard, LogOut,
  Shield, ShoppingCart, Search, Phone, Mail, Menu, X, PlusCircle
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

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { count, hydrated } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = session?.user?.email?.slice(0, 2).toUpperCase() ?? "?"

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top bar */}
      <div className="bg-slate-900 text-slate-300 text-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-amber-400" />
              +66 81-234-5678
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-amber-400" />
              info@learnhub.co.th
            </span>
          </div>
          <div className="flex items-center gap-4">
            {!session?.user && (
              <>
                <Link href="/login" className="hover:text-amber-400 transition-colors">เข้าสู่ระบบ</Link>
                <span className="text-slate-600">|</span>
                <Link href="/register" className="hover:text-amber-400 transition-colors">สมัครสมาชิก</Link>
              </>
            )}
            {session?.user && (
              <span className="text-slate-400">{session.user.email}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/courses" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-none">Learn</span>
              <span className="font-bold text-amber-500 text-lg leading-none">Hub</span>
            </div>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  pathname.startsWith(link.href)
                    ? "text-amber-600 bg-amber-50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {session?.user?.role === "ADMIN" && (
              <Link href="/admin" className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.startsWith("/admin") ? "text-amber-600 bg-amber-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
                ผู้ดูแลระบบ
              </Link>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
              <Search className="w-4 h-4" />
            </button>

            {session?.user?.role === "STUDENT" && (
              <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
                <ShoppingCart className="w-4 h-4" />
                {hydrated && count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {count}
                  </span>
                )}
              </Link>
            )}

            {session?.user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                    <span className="text-slate-900 font-bold text-xs">{initials}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">เข้าสู่ระบบในฐานะ</p>
                        <p className="text-sm font-semibold text-slate-800 truncate">{session.user.email}</p>
                        <span className="inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          {ROLE_LABELS[session.user.role]}
                        </span>
                      </div>
                      {session.user.role === "STUDENT" && (
                        <>
                          <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <LayoutDashboard className="w-4 h-4 text-amber-500" /> แดชบอร์ด
                          </Link>
                          <Link href="/dashboard/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <ShoppingCart className="w-4 h-4 text-amber-500" /> คำสั่งซื้อ
                          </Link>
                        </>
                      )}
                      {session.user.role === "ADMIN" && (
                        <>
                          <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <Shield className="w-4 h-4 text-amber-500" /> แดชบอร์ดผู้ดูแล
                          </Link>
                          <Link href="/admin/courses" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <BookOpen className="w-4 h-4 text-amber-500" /> จัดการคอร์ส
                          </Link>
                          <Link href="/admin/courses/new" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <PlusCircle className="w-4 h-4 text-amber-500" /> สร้างคอร์สใหม่
                          </Link>
                          <Link href="/admin/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            <ShoppingCart className="w-4 h-4 text-amber-500" /> จัดการคำสั่งซื้อ
                          </Link>
                        </>
                      )}
                      <div className="border-t border-slate-100 mt-1">
                        <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/login" }) }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          <LogOut className="w-4 h-4" /> ออกจากระบบ
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 text-sm font-bold transition-colors shadow-sm">
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-amber-50 hover:text-amber-700">
                {link.label}
              </Link>
            ))}
            {!session?.user && (
              <div className="flex gap-2 pt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 py-2 text-center text-sm font-medium border border-slate-200 rounded-lg text-slate-700">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 py-2 text-center text-sm font-bold bg-amber-400 rounded-lg text-slate-900">
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
