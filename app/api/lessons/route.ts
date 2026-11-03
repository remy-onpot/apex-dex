import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { db } from "@/lib/db"
import { isOwnedFeedImageUrl } from "@/lib/feed-storage"
import { requireMentor } from "@/lib/mentor-auth"
import { lessonSchema } from "@/lib/validations/lesson"

export async function POST(request: Request) {
  const auth = await requireMentor()
  if ("response" in auth) return auth.response

  try {
    const body = lessonSchema.parse(await request.json())
    if (body.imageUrls?.some((url) => !isOwnedFeedImageUrl(url, auth.userId))) {
      return NextResponse.json({ error: "Invalid image attachment" }, { status: 403 })
    }
    const lesson = await db.post.create({
      data: {
        title: body.title,
        content: body.content,
        imageUrls: body.imageUrls ?? [],
        published: true,
        type: "LESSON",
        authorId: auth.userId,
      },
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }
    return NextResponse.json({ error: "Unable to publish lesson" }, { status: 500 })
  }
}
