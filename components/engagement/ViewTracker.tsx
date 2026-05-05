"use client"

import { useEffect } from "react"

type Props = {
  endpoint: string
  storageKey: string
}

export function ViewTracker({ endpoint, storageKey }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return

    const tracked = window.sessionStorage.getItem(storageKey)
    if (tracked === "1") return

    window.sessionStorage.setItem(storageKey, "1")

    void fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch(() => {
      window.sessionStorage.removeItem(storageKey)
    })
  }, [endpoint, storageKey])

  return null
}
