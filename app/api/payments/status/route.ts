import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  applyVerifiedPaystackTransaction,
  verifyPaystackTransaction,
} from "@/lib/paystack"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const reference = new URL(request.url).searchParams.get("reference")
  if (!reference) {
    return NextResponse.json({ error: "Payment reference is required" }, { status: 400 })
  }

  const payment = await db.payment.findFirst({
    where: { reference, userId: session.user.id, provider: "PAYSTACK" },
  })
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 })

  if (payment.status === "PENDING") {
    try {
      const verified = await verifyPaystackTransaction(reference)
      await applyVerifiedPaystackTransaction(verified)
    } catch {
      return NextResponse.json(
        { status: "PENDING", message: "Payment confirmation is still pending" },
        { status: 200 }
      )
    }
  }

  const [updatedPayment, user] = await Promise.all([
    db.payment.findUnique({ where: { id: payment.id }, select: { status: true } }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionEndDate: true },
    }),
  ])

  return NextResponse.json({
    status: updatedPayment?.status ?? payment.status,
    subscriptionEndDate: user?.subscriptionEndDate?.toISOString() ?? null,
  })
}
