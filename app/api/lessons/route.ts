import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { isOwnedFeedImageUrl } from "@/lib/feed-storage"
import { lessonSchema } from "@/lib/validations/lesson"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const author = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (author?.role !== "MENTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = lessonSchema.parse(await request.json())
    if (body.imageUrls?.some((url) => !isOwnedFeedImageUrl(url, session.user.id))) {
      return NextResponse.json({ error: "Invalid image attachment" }, { status: 403 })
    }
    const lesson = await db.post.create({
      data: {
        title: body.title,
        content: body.content,
        imageUrls: body.imageUrls ?? [],
        published: true,
        type: "LESSON",
        authorId: session.user.id,
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
