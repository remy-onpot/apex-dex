import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { isOwnedFeedImageUrl } from "@/lib/feed-storage"
import { setupSchema } from "@/lib/validations/setup"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (session.user.role !== "MENTOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = setupSchema.parse(await request.json())
    if (body.imageUrls?.some((url) => !isOwnedFeedImageUrl(url, session.user.id))) {
      return NextResponse.json({ error: "Invalid image attachment" }, { status: 403 })
    }
    const post = await db.post.create({
      data: {
        title: body.title,
        content: body.content,
        imageUrls: body.imageUrls ?? [],
        published: true,
        authorId: session.user.id,
        type: "TRADE_SETUP",
        tradeMetadata: {
          create: {
            asset: body.asset,
            direction: body.direction,
            entryPrice: body.entryPrice,
            stopLoss: body.stopLoss,
            takeProfit: body.takeProfit,
          },
        },
      },
      include: { tradeMetadata: true },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }

    return NextResponse.json({ error: "Unable to create setup" }, { status: 500 })
  }
}
