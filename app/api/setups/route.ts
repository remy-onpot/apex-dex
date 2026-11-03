import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { db } from "@/lib/db"
import { isOwnedFeedImageUrl } from "@/lib/feed-storage"
import { requireMentor } from "@/lib/mentor-auth"
import { setupSchema } from "@/lib/validations/setup"

export async function POST(request: Request) {
  const auth = await requireMentor()
  if ("response" in auth) return auth.response

  try {
    const body = setupSchema.parse(await request.json())
    if (body.imageUrls?.some((url) => !isOwnedFeedImageUrl(url, auth.userId))) {
      return NextResponse.json({ error: "Invalid image attachment" }, { status: 403 })
    }
    const post = await db.post.create({
      data: {
        title: body.title,
        content: body.content,
        imageUrls: body.imageUrls ?? [],
        published: true,
        authorId: auth.userId,
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
