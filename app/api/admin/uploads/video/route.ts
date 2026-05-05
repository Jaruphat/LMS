import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextRequest, NextResponse } from "next/server"
import { requireRole } from "@/lib/api"
import { saveVideoFile, getVideoUploadMode } from "@/lib/uploads"
import {
  assertVideoUploadPath,
  VIDEO_ALLOWED_MIME_TYPES,
  VIDEO_CLIENT_MAX_FILE_SIZE,
} from "@/lib/videoUpload"

export const runtime = "nodejs"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { session, error } = await requireRole("ADMIN")
    if (error) {
      return error
    }

    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      if (getVideoUploadMode() !== "client-blob") {
        return NextResponse.json(
          { error: "Direct Blob upload is not enabled. Add BLOB_READ_WRITE_TOKEN or use the local file upload fallback." },
          { status: 400 }
        )
      }

      const body = (await request.json()) as HandleUploadBody
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          assertVideoUploadPath(pathname)

          return {
            allowedContentTypes: [...VIDEO_ALLOWED_MIME_TYPES],
            addRandomSuffix: true,
            maximumSizeInBytes: VIDEO_CLIENT_MAX_FILE_SIZE,
            tokenPayload: JSON.stringify({
              uploadedById: session!.user.id,
            }),
          }
        },
      })

      return NextResponse.json(jsonResponse)
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please select a video file before uploading." }, { status: 400 })
    }

    const url = await saveVideoFile(file, { uploaderId: session!.user.id })
    return NextResponse.json({ url, mode: "server" }, { status: 201 })
  } catch (cause) {
    console.error("Failed to upload admin video", cause)

    const message = cause instanceof Error ? cause.message : "Unable to upload the video right now."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
