import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { db } from "@/lib/db"
import { deleteFeedImages, isOwnedFeedImageUrl } from "@/lib/feed-storage"
import { requireMentor } from "@/lib/mentor-auth"
import { getPostImageUrls } from "@/lib/post-images"
import { announcementSchema } from "@/lib/validations/announcement"

type RouteContext = { params: { announcementId: string } }

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireMentor()
  if ("response" in auth) return auth.response

  let input: unknown
  try {
    input = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  try {
    const body = announcementSchema.parse(input)
    const existing = await db.post.findFirst({
      where: { id: params.announcementId, authorId: auth.userId, type: "ANNOUNCEMENT" },
      select: { imageUrls: true },
    })
    if (!existing) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    const imageUrls = body.imageUrls ?? getPostImageUrls(existing.imageUrls)
    if (imageUrls.some((url) => !isOwnedFeedImageUrl(url, auth.userId))) {
      return NextResponse.json({ error: "Invalid image attachment" }, { status: 403 })
    }
    const removedImages = getPostImageUrls(existing.imageUrls).filter(
      (url) => !imageUrls.includes(url)
    )

    await deleteFeedImages(removedImages, auth.userId)
    const announcement = await db.post.update({
      where: { id: params.announcementId },
      data: {
        title: body.text.slice(0, 120),
        content: body.text,
        imageUrls,
      },
    })

    return NextResponse.json(announcement)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }
    return NextResponse.json({ error: "Unable to update announcement" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireMentor()
  if ("response" in auth) return auth.response

  const announcement = await db.post.findFirst({
    where: {
      id: params.announcementId,
      authorId: auth.userId,
      type: "ANNOUNCEMENT",
    },
    select: { id: true, imageUrls: true },
  })
  if (!announcement) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
  }

  try {
    await deleteFeedImages(getPostImageUrls(announcement.imageUrls), auth.userId)
    await db.post.delete({ where: { id: announcement.id } })
    return NextResponse.json({ id: announcement.id })
  } catch {
    return NextResponse.json(
      { error: "Unable to delete announcement and its images" },
      { status: 502 }
    )
  }
}
