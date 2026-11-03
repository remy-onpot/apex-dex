import { createHmac, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import {
  applyVerifiedPaystackTransaction,
  verifyPaystackTransaction,
} from "@/lib/paystack"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY
  const signature = request.headers.get("x-paystack-signature")
  if (!secret || !signature) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  const rawBody = Buffer.from(await request.arrayBuffer())
  const expected = createHmac("sha512", secret).update(rawBody).digest()
  let supplied: Buffer
  try {
    supplied = Buffer.from(signature, "hex")
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  let event: { event?: string; data?: { reference?: unknown } }
  try {
    event = JSON.parse(rawBody.toString("utf8"))
  } catch {
    return NextResponse.json({ error: "Invalid webhook body" }, { status: 400 })
  }

  if (event.event !== "charge.success" && event.event !== "charge.failed") {
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference
  if (typeof reference !== "string") {
    return NextResponse.json({ error: "Missing payment reference" }, { status: 400 })
  }

  const payment = await db.payment.findUnique({ where: { reference } })
  if (!payment || payment.provider !== "PAYSTACK") {
    return NextResponse.json({ received: true })
  }

  try {
    const verified = await verifyPaystackTransaction(reference)
    await applyVerifiedPaystackTransaction(verified)
    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 503 })
  }
}
