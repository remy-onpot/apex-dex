import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getSubscriptionUser, logInactiveSubscriptionAdvisory } from "@/lib/subscription"

export async function POST(
  _request: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const dbUser = await getSubscriptionUser(session.user.id)
  if (!dbUser) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }
  if (dbUser.role === "STUDENT") {
    logInactiveSubscriptionAdvisory(session.user.id, dbUser)
    // TODO(Phase 6): enable the 403 after Paystack sandbox cases pass.
    // if (!hasActiveSubscription(dbUser)) return NextResponse.json({ error: "Active subscription required" }, { status: 403 })
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
