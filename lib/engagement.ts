export function averageRatingFromEntries(entries: Array<{ rating: number }>) {
  if (entries.length === 0) return 0
  const total = entries.reduce((sum, entry) => sum + entry.rating, 0)
  return Math.round((total / entries.length) * 10) / 10
}

export function clampRating(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)))
}
