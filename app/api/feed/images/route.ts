import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"

import { authOptions } from "@/lib/auth"
import { publicFeedImageUrl, uploadFeedImage } from "@/lib/feed-storage"

export const runtime = "nodejs"

const maxImageBytes = 8 * 1024 * 1024
const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
])

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (file.type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (file.type === "image/png") {
    return bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
  }
  if (file.type === "image/webp") {
    return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  }
  return false
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "MENTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 })
  }

  const file = formData.get("file")
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Choose an image to upload" }, { status: 422 })
  }

  const extension = imageTypes.get(file.type)
  if (!extension) {
    return NextResponse.json(
      { error: "Images must be JPG, PNG, or WebP" },
      { status: 415 }
    )
  }
  if (file.size <= 0 || file.size > maxImageBytes) {
    return NextResponse.json({ error: "Each image must be under 8 MB" }, { status: 413 })
  }
  if (!(await hasValidImageSignature(file))) {
    return NextResponse.json({ error: "The selected file is not a valid image" }, { status: 415 })
  }

  const path = `feed/${session.user.id}/${randomUUID()}.${extension}`
  try {
    await uploadFeedImage(path, file)
    return NextResponse.json({ url: publicFeedImageUrl(path) }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload image"
    const status = message.includes("not configured") ? 503 : 502
    return NextResponse.json({ error: message }, { status })
  }
}
