const moneyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("th-TH")

const dateTimeFormatter = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeStyle: "short",
})

const shortDateFormatter = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
})

export function formatPrice(value: number) {
  return moneyFormatter.format(value)
}

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "-"

  const date = typeof value === "string" ? new Date(value) : value
  return dateTimeFormatter.format(date)
}

export function formatShortDate(value: Date | string | null | undefined) {
  if (!value) return "-"

  const date = typeof value === "string" ? new Date(value) : value
  return shortDateFormatter.format(date)
}
