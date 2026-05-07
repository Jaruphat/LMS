"use client"

import dynamic from "next/dynamic"
import { SessionProvider } from "next-auth/react"
import { CartProvider } from "@/components/cart/CartProvider"

const FloatingAssistant = dynamic(
  () => import("@/components/chatbot/FloatingAssistant").then((module) => module.FloatingAssistant),
  { ssr: false }
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <FloatingAssistant />
      </CartProvider>
    </SessionProvider>
  )
}
