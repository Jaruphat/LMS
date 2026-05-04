"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useClientReady } from "@/lib/useClientReady"

export function RegisterPageClient({ callbackUrl }: { callbackUrl: string | null }) {
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

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const result = await response.json()
      setError(result.error ?? "เกิดข้อผิดพลาด")
      setLoading(false)
      return
    }

    await signIn("credentials", { email, password, redirect: false })
    router.push(callbackUrl ?? "/courses")
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
          <span className="text-xl font-bold text-white">L</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">สร้างบัญชีใหม่</h1>
        <p className="mt-1 text-sm text-slate-500">เริ่มต้นเรียนรู้และสั่งซื้อคอร์สได้ทันที</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          data-testid="register-form"
          data-client-ready={clientReady ? "true" : "false"}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">อีเมล</label>
            <input
              data-testid="register-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              รหัสผ่าน <span className="font-normal text-slate-400">(อย่างน้อย 8 ตัวอักษร)</span>
            </label>
            <input
              data-testid="register-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}

          <button
            data-testid="register-submit"
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "กำลังสมัคร..." : "สมัครใช้งาน"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          มีบัญชีแล้ว?{" "}
          <Link
            href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}
