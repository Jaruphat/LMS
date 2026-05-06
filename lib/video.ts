export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

export function isDirectVideoFile(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url)
}

export function getVideoPreviewImage(url: string): string | null {
  const videoId = extractYouTubeId(url)
  if (!videoId) return null

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export function getVideoSourceLabel(url: string) {
  if (extractYouTubeId(url)) return "YouTube"
  if (isDirectVideoFile(url)) return "ไฟล์วิดีโอ"
  return "วิดีโอ"
}
