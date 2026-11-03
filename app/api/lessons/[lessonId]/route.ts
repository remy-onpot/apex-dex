import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { db } from "@/lib/db"
import { deleteFeedImages, isOwnedFeedImageUrl } from "@/lib/feed-storage"
import { requireMentor } from "@/lib/mentor-auth"
import { getPostImageUrls } from "@/lib/post-images"
import { lessonSchema } from "@/lib/validations/lesson"

type RouteContext = { params: { lessonId: string } }

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
    const body = lessonSchema.parse(input)
    const existing = await db.post.findFirst({
      where: { id: params.lessonId, authorId: auth.userId, type: "LESSON" },
      select: { imageUrls: true },
    })
    if (!existing) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

    const imageUrls = body.imageUrls ?? getPostImageUrls(existing.imageUrls)
    if (imageUrls.some((url) => !isOwnedFeedImageUrl(url, auth.userId))) {
      return NextResponse.json({ error: "Invalid image attachment" }, { status: 403 })
    }
    const removedImages = getPostImageUrls(existing.imageUrls).filter(
      (url) => !imageUrls.includes(url)
    )

    await deleteFeedImages(removedImages, auth.userId)
    const lesson = await db.post.update({
      where: { id: params.lessonId },
      data: {
        title: body.title,
        content: body.content,
        imageUrls,
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }
    return NextResponse.json({ error: "Unable to update lesson" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireMentor()
  if ("response" in auth) return auth.response

  const lesson = await db.post.findFirst({
    where: { id: params.lessonId, authorId: auth.userId, type: "LESSON" },
    select: { id: true, imageUrls: true },
  })
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

  try {
    await deleteFeedImages(getPostImageUrls(lesson.imageUrls), auth.userId)
    await db.post.delete({ where: { id: lesson.id } })
    return NextResponse.json({ id: lesson.id })
  } catch {
    return NextResponse.json(
      { error: "Unable to delete lesson and its images" },
      { status: 502 }
    )
  }
}
