"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useClientReady } from "@/lib/useClientReady"

export function LoginPageClient({ callbackUrl }: { callbackUrl: string | null }) {
  const router = useRouter()
  const clientReady = useClientReady()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      setLoading(false)
      return
    }

    router.push(callbackUrl ?? "/courses")
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
          <span className="text-xl font-bold text-white">L</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">ยินดีต้อนรับกลับ</h1>
        <p className="mt-1 text-sm text-slate-500">เข้าสู่ระบบเพื่อเรียนต่อและจัดการคำสั่งซื้อ</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-testid="login-form"
          data-client-ready={clientReady ? "true" : "false"}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">อีเมล</label>
            <input
              data-testid="login-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
            <input
              data-testid="login-password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

          <button
            data-testid="login-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          ยังไม่มีบัญชี?{" "}
          <Link
            href={callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/register"}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            สมัครใช้งาน
          </Link>
        </p>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">Demo: student@lms.dev / student1234</p>
    </div>
  )
}
