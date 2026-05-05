import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { put } from "@vercel/blob"
import {
  VIDEO_ALLOWED_MIME_TYPES,
  VIDEO_MULTIPART_THRESHOLD,
  VIDEO_SERVER_MAX_FILE_SIZE,
  type VideoUploadMode,
} from "@/lib/videoUpload"

const SLIP_MAX_FILE_SIZE = 4.5 * 1024 * 1024
const SLIP_BLOB_PATH_PREFIX = "slips"
const VIDEO_BLOB_PATH_PREFIX = "videos"

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
}

const VIDEO_MIME_TO_EXT: Record<string, string> = {
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/ogg": ".ogg",
  "video/quicktime": ".mov",
  "video/x-m4v": ".m4v",
}

function getSlipFileExtension(file: File) {
  const extension = MIME_TO_EXT[file.type]

  if (!extension) {
    throw new Error("Only JPG, PNG, and PDF slip files are supported.")
  }

  return extension
}

function getVideoFileExtension(file: File) {
  const mimeExtension = VIDEO_MIME_TO_EXT[file.type]

  if (mimeExtension) {
    return mimeExtension
  }

  const fileName = file.name.toLowerCase()
  const matchedExtension = Object.values(VIDEO_MIME_TO_EXT).find((extension) => fileName.endsWith(extension))

  if (!matchedExtension) {
    throw new Error("Only MP4, WebM, OGG, MOV, and M4V video files are supported.")
  }

  return matchedExtension
}

function buildSlipPathname(file: File, orderId?: string) {
  const extension = getSlipFileExtension(file)
  const fileName = `${Date.now()}-${randomUUID()}${extension}`

  if (orderId) {
    return `${SLIP_BLOB_PATH_PREFIX}/${orderId}/${fileName}`
  }

  return `${SLIP_BLOB_PATH_PREFIX}/${fileName}`
}

function buildVideoPathname(file: File, uploaderId?: string) {
  const extension = getVideoFileExtension(file)
  const fileName = `${Date.now()}-${randomUUID()}${extension}`

  if (uploaderId) {
    return `${VIDEO_BLOB_PATH_PREFIX}/${uploaderId}/${fileName}`
  }

  return `${VIDEO_BLOB_PATH_PREFIX}/${fileName}`
}

async function saveFileToLocal(pathname: string, file: File) {
  const uploadRoot = path.join(process.cwd(), "public", "uploads")
  const filePath = path.join(uploadRoot, pathname)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  return `/uploads/${pathname}`
}

async function saveFileToBlob(pathname: string, file: File) {
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
    multipart: file.size > VIDEO_MULTIPART_THRESHOLD,
  })

  return blob.url
}

function canUseBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export function getSlipStorageMode() {
  return canUseBlobStorage() ? "vercel-blob" : "local"
}

export function getVideoUploadMode(): VideoUploadMode {
  return canUseBlobStorage() ? "client-blob" : "server"
}

export async function saveSlipFile(file: File, options?: { orderId?: string }) {
  if (file.size === 0) {
    throw new Error("Please select a slip file before uploading.")
  }

  if (file.size > SLIP_MAX_FILE_SIZE) {
    throw new Error("Slip file must be 4.5MB or smaller.")
  }

  getSlipFileExtension(file)

  const pathname = buildSlipPathname(file, options?.orderId)

  if (getSlipStorageMode() === "vercel-blob") {
    return saveFileToBlob(pathname, file)
  }

  return saveFileToLocal(pathname, file)
}

export async function saveVideoFile(file: File, options?: { uploaderId?: string }) {
  if (file.size === 0) {
    throw new Error("Please select a video file before uploading.")
  }

  if (!VIDEO_ALLOWED_MIME_TYPES.includes(file.type as (typeof VIDEO_ALLOWED_MIME_TYPES)[number])) {
    getVideoFileExtension(file)
  }

  if (file.size > VIDEO_SERVER_MAX_FILE_SIZE) {
    throw new Error("Server-side video uploads support files up to 256MB. Use the deployed app with Vercel Blob for larger files.")
  }

  const pathname = buildVideoPathname(file, options?.uploaderId)

  if (canUseBlobStorage()) {
    return saveFileToBlob(pathname, file)
  }

  return saveFileToLocal(pathname, file)
}
