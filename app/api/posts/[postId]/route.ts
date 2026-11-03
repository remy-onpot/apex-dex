import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { db } from "@/lib/db"
import { deleteFeedImages } from "@/lib/feed-storage"
import { requireMentor } from "@/lib/mentor-auth"
import { getPostImageUrls } from "@/lib/post-images"
import { postPatchSchema } from "@/lib/validations/post"

type RouteContext = { params: { postId: string } }

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireMentor()
  if ("response" in auth) return auth.response

  const post = await db.post.findFirst({
    where: { id: params.postId, authorId: auth.userId },
    select: { id: true, imageUrls: true },
  })
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

  try {
    await deleteFeedImages(getPostImageUrls(post.imageUrls), auth.userId)
    await db.post.delete({ where: { id: post.id } })
    return NextResponse.json({ id: post.id })
  } catch {
    return NextResponse.json(
      { error: "Unable to delete post and its images" },
      { status: 502 }
    )
  }
}

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
    const body = postPatchSchema.parse(input)
    const post = await db.post.findFirst({
      where: { id: params.postId, authorId: auth.userId },
      select: { id: true },
    })
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    const updated = await db.post.update({
      where: { id: post.id },
      data: { title: body.title, content: body.content },
    })
    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }
    return NextResponse.json({ error: "Unable to update post" }, { status: 500 })
  }
}
