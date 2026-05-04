const moneyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
})

const dateTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatPrice(value: number) {
  return moneyFormatter.format(value)
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-"

  const date = typeof value === "string" ? new Date(value) : value
  return dateTimeFormatter.format(date)
}
