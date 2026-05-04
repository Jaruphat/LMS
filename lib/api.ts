import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions, resolveSessionUser } from "@/lib/auth"
import type { Role } from "@/types"

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  const user = await resolveSessionUser(session?.user)

  if (!session?.user || !user) {
    return {
      session: null,
      error: NextResponse.json({ error: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง" }, { status: 401 }),
    }
  }

  return {
    session: {
      ...session,
      user,
    },
    error: null,
  }
}

export async function requireRole(role: Role) {
  const { session, error } = await requireAuth()
  if (error) return { session: null, error }
  if (session!.user.role !== role) {
    return {
      session: null,
      error: NextResponse.json({ error: "คุณไม่มีสิทธิ์ใช้งานส่วนนี้" }, { status: 403 }),
    }
  }
  return { session, error: null }
}
