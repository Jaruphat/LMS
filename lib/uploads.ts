import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import { put } from "@vercel/blob"

const MAX_FILE_SIZE = 4.5 * 1024 * 1024
const BLOB_PATH_PREFIX = "slips"

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
}

function getFileExtension(file: File) {
  const extension = MIME_TO_EXT[file.type]

  if (!extension) {
    throw new Error("Only JPG, PNG, and PDF slip files are supported.")
  }

  return extension
}

function buildSlipPathname(file: File, orderId?: string) {
  const extension = getFileExtension(file)
  const fileName = `${Date.now()}-${randomUUID()}${extension}`

  if (orderId) {
    return `${BLOB_PATH_PREFIX}/${orderId}/${fileName}`
  }

  return `${BLOB_PATH_PREFIX}/${fileName}`
}

async function saveSlipToLocal(pathname: string, file: File) {
  const uploadRoot = path.join(process.cwd(), "public", "uploads")
  const filePath = path.join(uploadRoot, pathname)

  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  return `/uploads/${pathname}`
}

async function saveSlipToBlob(pathname: string, file: File) {
  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  })

  return blob.url
}

export function getSlipStorageMode() {
  return process.env.BLOB_READ_WRITE_TOKEN ? "vercel-blob" : "local"
}

export async function saveSlipFile(file: File, options?: { orderId?: string }) {
  if (file.size === 0) {
    throw new Error("Please select a slip file before uploading.")
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Slip file must be 4.5MB or smaller.")
  }

  getFileExtension(file)

  const pathname = buildSlipPathname(file, options?.orderId)

  if (getSlipStorageMode() === "vercel-blob") {
    return saveSlipToBlob(pathname, file)
  }

  return saveSlipToLocal(pathname, file)
}
