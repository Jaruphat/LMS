export type VideoUploadMode = "client-blob" | "server"

export const VIDEO_ALLOWED_EXTENSIONS = [".mp4", ".webm", ".ogg", ".mov", ".m4v"] as const

export const VIDEO_ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-m4v",
] as const

export const VIDEO_ACCEPT_ATTRIBUTE = [...VIDEO_ALLOWED_EXTENSIONS, ...VIDEO_ALLOWED_MIME_TYPES].join(",")
export const VIDEO_CLIENT_MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024
export const VIDEO_SERVER_MAX_FILE_SIZE = 256 * 1024 * 1024
export const VIDEO_MULTIPART_THRESHOLD = 5 * 1024 * 1024

function getLowerCaseExtension(fileName: string) {
  const normalized = fileName.split("?")[0]?.trim() ?? ""
  const lastDotIndex = normalized.lastIndexOf(".")

  if (lastDotIndex < 0) {
    return ""
  }

  return normalized.slice(lastDotIndex).toLowerCase()
}

export function isAllowedVideoExtension(fileName: string) {
  const extension = getLowerCaseExtension(fileName)
  return VIDEO_ALLOWED_EXTENSIONS.includes(extension as (typeof VIDEO_ALLOWED_EXTENSIONS)[number])
}

export function normalizeUploadFileName(fileName: string) {
  const extension = isAllowedVideoExtension(fileName) ? getLowerCaseExtension(fileName) : ".mp4"
  const baseName = fileName.slice(0, Math.max(0, fileName.length - extension.length))
  const sanitizedBaseName =
    baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "lesson-video"

  return `${sanitizedBaseName}${extension}`
}

export function buildVideoUploadPath(fileName: string) {
  return `videos/${normalizeUploadFileName(fileName)}`
}

export function assertVideoUploadPath(pathname: string) {
  if (!pathname.startsWith("videos/")) {
    throw new Error("Video uploads must stay inside the videos folder.")
  }

  const fileName = pathname.split("/").pop() ?? ""

  if (!fileName || !isAllowedVideoExtension(fileName)) {
    throw new Error("Only MP4, WebM, OGG, MOV, and M4V video files are supported.")
  }
}
