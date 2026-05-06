import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export const dynamic = "force-dynamic"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#fefaf9]">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
      <Footer />
    </div>
  )
}
