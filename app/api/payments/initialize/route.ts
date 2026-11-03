import { randomUUID } from "node:crypto"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { weeklyPass } from "@/config/membership"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { initializePaystackTransaction, isPaystackConfigured } from "@/lib/paystack"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in before checkout" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  })
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 })
  if (user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only student accounts can purchase access" }, { status: 403 })
  }
  if (!user.email) {
    return NextResponse.json({ error: "Add an email address before checkout" }, { status: 400 })
  }
  if (!isPaystackConfigured()) {
    return NextResponse.json({ error: "Mobile Money checkout is not configured yet" }, { status: 503 })
  }

  const reference = randomUUID()
  await db.payment.create({
    data: {
      userId: user.id,
      amount: weeklyPass.amountSubunits,
      currency: weeklyPass.currency,
      reference,
      provider: "PAYSTACK",
      status: "PENDING",
    },
  })

  try {
    const authorizationUrl = await initializePaystackTransaction({
      email: user.email,
      reference,
    })
    return NextResponse.json({ authorizationUrl, reference }, { status: 201 })
  } catch {
    await db.payment.updateMany({
      where: { reference, status: "PENDING" },
      data: { status: "FAILED" },
    })
    return NextResponse.json(
      { error: "Could not start Mobile Money checkout. Please try again." },
      { status: 502 }
    )
  }
}
