import { db } from "@/lib/db"
import { hasActiveSubscription } from "@/lib/subscription"
import { weeklyPass } from "@/config/membership"
import { env } from "@/env.mjs"

const apiBaseUrl = "https://api.paystack.co"

type PaystackEnvelope<T> = {
  status: boolean
  message: string
  data: T
}

export type VerifiedPaystackTransaction = {
  id: number | string
  status: string
  reference: string
  amount: number
  currency: string
  paid_at?: string | null
  paidAt?: string | null
}

export function isPaystackConfigured() {
  return Boolean(env.PAYSTACK_SECRET_KEY)
}

function getSecretKey() {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new Error("Paystack is not configured")
  }
  return env.PAYSTACK_SECRET_KEY
}

export async function initializePaystackTransaction({
  email,
  reference,
}: {
  email: string
  reference: string
}) {
  const response = await fetch(`${apiBaseUrl}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: String(weeklyPass.amountSubunits),
      currency: weeklyPass.currency,
      reference,
      callback_url: new URL("/checkout/return", env.NEXT_PUBLIC_APP_URL).toString(),
      channels: ["mobile_money"],
      metadata: JSON.stringify({ product: "Apex Desk Weekly Pass" }),
    }),
    cache: "no-store",
  })

  const result = (await response.json().catch(() => null)) as
    | PaystackEnvelope<{
        authorization_url?: string
        reference?: string
      }>
    | null

  if (
    !response.ok ||
    !result?.status ||
    !result.data.authorization_url ||
    result.data.reference !== reference ||
    !result.data.authorization_url.startsWith("https://checkout.paystack.com/")
  ) {
    throw new Error("Unable to start Mobile Money checkout")
  }

  return result.data.authorization_url
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `${apiBaseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getSecretKey()}` },
      cache: "no-store",
    }
  )
  const result = (await response.json().catch(() => null)) as
    | PaystackEnvelope<VerifiedPaystackTransaction>
    | null

  if (!response.ok || !result?.status || !result.data) {
    throw new Error("Unable to verify payment with Paystack")
  }

  if (
    result.data.reference !== reference ||
    result.data.amount !== weeklyPass.amountSubunits ||
    result.data.currency !== weeklyPass.currency
  ) {
    throw new Error("Payment details do not match the Apex Desk weekly pass")
  }

  return result.data
}

export async function applyVerifiedPaystackTransaction(
  transaction: VerifiedPaystackTransaction
) {
  if (
    transaction.amount !== weeklyPass.amountSubunits ||
    transaction.currency !== weeklyPass.currency
  ) {
    throw new Error("Payment details do not match the Apex Desk weekly pass")
  }

  if (transaction.status === "failed") {
    await db.payment.updateMany({
      where: { reference: transaction.reference, status: "PENDING" },
      data: { status: "FAILED" },
    })
  }

  return db.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { reference: transaction.reference },
    })
    if (!payment || payment.provider !== "PAYSTACK") {
      throw new Error("Payment reference not found")
    }
    if (payment.amount !== transaction.amount || payment.currency !== transaction.currency) {
      throw new Error("Payment record does not match the verified transaction")
    }

    if (payment.status !== "PENDING" || transaction.status !== "success") {
      const user = await tx.user.findUnique({
        where: { id: payment.userId },
        select: { subscriptionEndDate: true },
      })
      return { payment, subscriptionEndDate: user?.subscriptionEndDate ?? null }
    }

    const paidAt = transaction.paid_at ?? transaction.paidAt
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: {
        status: "SUCCEEDED",
        paidAt: paidAt ? new Date(paidAt) : new Date(),
      },
    })

    if (claimed.count === 0) {
      const current = await tx.payment.findUnique({ where: { id: payment.id } })
      const user = await tx.user.findUnique({
        where: { id: payment.userId },
        select: { subscriptionEndDate: true },
      })
      if (!current) throw new Error("Payment record not found")
      return { payment: current, subscriptionEndDate: user?.subscriptionEndDate ?? null }
    }

    const user = await tx.user.findUnique({
      where: { id: payment.userId },
      select: { isPremium: true, subscriptionEndDate: true },
    })
    if (!user) throw new Error("Payment user not found")

    const now = new Date()
    const extensionStart = hasActiveSubscription(user, now)
      ? user.subscriptionEndDate!
      : now
    const subscriptionEndDate = new Date(
      extensionStart.getTime() + weeklyPass.durationDays * 24 * 60 * 60 * 1000
    )

    await tx.user.update({
      where: { id: payment.userId },
      data: { isPremium: true, subscriptionEndDate },
    })

    const succeededPayment = await tx.payment.findUnique({
      where: { id: payment.id },
    })
    if (!succeededPayment) throw new Error("Payment record not found")

    return { payment: succeededPayment, subscriptionEndDate }
  })
}
