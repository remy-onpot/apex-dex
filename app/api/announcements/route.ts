import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { z, ZodError } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { isOwnedFeedImageUrl } from "@/lib/feed-storage"

const announcementSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  imageUrls: z.array(z.string().url()).max(6).default([]),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "MENTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = announcementSchema.parse(await request.json())
    if (body.imageUrls.some((url) => !isOwnedFeedImageUrl(url, session.user.id))) {
      return NextResponse.json({ error: "Invalid image attachment" }, { status: 403 })
    }

    const post = await db.post.create({
      data: {
        title: body.text.slice(0, 120),
        content: body.text,
        imageUrls: body.imageUrls,
        published: true,
        type: "ANNOUNCEMENT",
        authorId: session.user.id,
      },
      select: { id: true },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }
    return NextResponse.json({ error: "Unable to publish update" }, { status: 500 })
  }
}
