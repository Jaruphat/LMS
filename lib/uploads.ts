import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"

const MAX_FILE_SIZE = 5 * 1024 * 1024

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
}

export async function saveSlipFile(file: File) {
  if (file.size === 0) {
    throw new Error("Please select a slip file before uploading.")
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Slip file must be 5MB or smaller.")
  }

  const extension = MIME_TO_EXT[file.type]
  if (!extension) {
    throw new Error("Only JPG, PNG, and PDF slip files are supported.")
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "slips")
  await mkdir(uploadDir, { recursive: true })

  const fileName = `${Date.now()}-${randomUUID()}${extension}`
  const filePath = path.join(uploadDir, fileName)
  const bytes = Buffer.from(await file.arrayBuffer())

  await writeFile(filePath, bytes)

  return `/uploads/slips/${fileName}`
}
