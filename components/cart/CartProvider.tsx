"use client"

import { createContext, useContext, useSyncExternalStore } from "react"

export interface CartItem {
  courseId: string
  title: string
  price: number
  thumbnailUrl?: string | null
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  hydrated: boolean
  addItem: (item: CartItem) => void
  removeItem: (courseId: string) => void
  clear: () => void
  hasItem: (courseId: string) => boolean
}

const STORAGE_KEY = "learnhub-cart:v1"
const CART_EVENT = "learnhub-cart:change"
const EMPTY_ITEMS: CartItem[] = []
const CartContext = createContext<CartContextValue | null>(null)
let cachedRawCart: string | null | undefined
let cachedItemsSnapshot: CartItem[] = EMPTY_ITEMS

function parseStoredCart(raw: string | null) {
  if (!raw) return EMPTY_ITEMS

  try {
    const parsed = JSON.parse(raw) as { version?: number; items?: CartItem[] }
    if (parsed.version !== 1 || !Array.isArray(parsed.items)) return EMPTY_ITEMS
    return parsed.items
  } catch {
    return EMPTY_ITEMS
  }
}

function getItemsSnapshot() {
  if (typeof window === "undefined") return EMPTY_ITEMS
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (raw === cachedRawCart) {
    return cachedItemsSnapshot
  }

  cachedRawCart = raw
  cachedItemsSnapshot = parseStoredCart(raw)
  return cachedItemsSnapshot
}

function writeItems(nextItems: CartItem[]) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: 1,
      items: nextItems,
    })
  )

  window.dispatchEvent(new Event(CART_EVENT))
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handler = () => onStoreChange()

  window.addEventListener("storage", handler)
  window.addEventListener(CART_EVENT, handler)

  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(CART_EVENT, handler)
  }
}

function subscribeHydration() {
  return () => undefined
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getItemsSnapshot, () => EMPTY_ITEMS)
  const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false)

  function addItem(item: CartItem) {
    const current = getItemsSnapshot()
    if (current.some((existing) => existing.courseId === item.courseId)) {
      return
    }

    writeItems([...current, item])
  }

  function removeItem(courseId: string) {
    const current = getItemsSnapshot()
    writeItems(current.filter((item) => item.courseId !== courseId))
  }

  function clear() {
    writeItems([])
  }

  function hasItem(courseId: string) {
    return items.some((item) => item.courseId === courseId)
  }

  const total = items.reduce((sum, item) => sum + item.price, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        count: items.length,
        total,
        hydrated,
        addItem,
        removeItem,
        clear,
        hasItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) {
    throw new Error("useCart must be used inside CartProvider.")
  }

  return value
}
