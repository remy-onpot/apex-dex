import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  _request: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await db.postReadReceipt.upsert({
    where: {
      userId_postId: {
        userId: session.user.id,
        postId: params.postId,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      postId: params.postId,
    },
  })

  return new NextResponse(null, { status: 200 })
}
