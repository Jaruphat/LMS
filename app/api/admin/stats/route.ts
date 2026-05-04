import { NextResponse } from "next/server"
import { requireRole } from "@/lib/api"
import { getAdminDashboardData } from "@/lib/data"

export async function GET() {
  const { error } = await requireRole("ADMIN")
  if (error) return error

  const data = await getAdminDashboardData()
  return NextResponse.json(data)
}
