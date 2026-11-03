import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { ZodError, z } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const commentSchema = z.object({
  postId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = commentSchema.parse(await request.json())
    const post = await db.post.findFirst({
      where: { id: body.postId, published: true },
      select: { id: true },
    })
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })

    const comment = await db.comment.create({
      data: { postId: post.id, authorId: session.user.id, content: body.content },
      include: { author: { select: { name: true } } },
    })
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }
    return NextResponse.json({ error: "Unable to post comment" }, { status: 500 })
  }
}
