import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { db } from "@/lib/db"
import { deleteFeedImages, isOwnedFeedImageUrl } from "@/lib/feed-storage"
import { requireMentor } from "@/lib/mentor-auth"
import { getPostImageUrls } from "@/lib/post-images"
import { setupSchema } from "@/lib/validations/setup"

type RouteContext = { params: { setupId: string } }

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
    const body = setupSchema.parse(input)
    const existing = await db.post.findFirst({
      where: { id: params.setupId, authorId: auth.userId, type: "TRADE_SETUP" },
      select: { imageUrls: true, tradeMetadata: { select: { postId: true } } },
    })
    if (!existing?.tradeMetadata) {
      return NextResponse.json({ error: "Setup not found" }, { status: 404 })
    }

    const imageUrls = body.imageUrls ?? getPostImageUrls(existing.imageUrls)
    if (imageUrls.some((url) => !isOwnedFeedImageUrl(url, auth.userId))) {
      return NextResponse.json({ error: "Invalid image attachment" }, { status: 403 })
    }
    const removedImages = getPostImageUrls(existing.imageUrls).filter(
      (url) => !imageUrls.includes(url)
    )

    await deleteFeedImages(removedImages, auth.userId)
    const setup = await db.post.update({
      where: { id: params.setupId },
      data: {
        title: body.title,
        content: body.content,
        imageUrls,
        tradeMetadata: {
          update: {
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

    return NextResponse.json(setup)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }
    return NextResponse.json({ error: "Unable to update setup" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireMentor()
  if ("response" in auth) return auth.response

  const setup = await db.post.findFirst({
    where: { id: params.setupId, authorId: auth.userId, type: "TRADE_SETUP" },
    select: { id: true, imageUrls: true },
  })
  if (!setup) return NextResponse.json({ error: "Setup not found" }, { status: 404 })

  try {
    await deleteFeedImages(getPostImageUrls(setup.imageUrls), auth.userId)
    await db.post.delete({ where: { id: setup.id } })
    return NextResponse.json({ id: setup.id })
  } catch {
    return NextResponse.json(
      { error: "Unable to delete setup and its images" },
      { status: 502 }
    )
  }
}
