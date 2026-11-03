"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"

type PaymentState = "checking" | "pending" | "succeeded" | "failed"

export function PaymentReturnWatcher({ reference }: { reference: string }) {
  const [state, setState] = useState<PaymentState>("checking")
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let isCurrent = true

    async function checkPayment() {
      setState("checking")

      for (let check = 0; check < 8; check += 1) {
        if (check > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2500))
        }
        if (!isCurrent) return

        try {
          const response = await fetch(
            `/api/payments/status?reference=${encodeURIComponent(reference)}`,
            { cache: "no-store" }
          )
          const result = await response.json()
          if (!response.ok) throw new Error("Unable to check payment")
          if (!isCurrent) return

          if (result.status === "SUCCEEDED") {
            setSubscriptionEndDate(result.subscriptionEndDate ?? null)
            setState("succeeded")
            return
          }
          if (result.status === "FAILED" || result.status === "REFUNDED") {
            setState("failed")
            return
          }
          setState("pending")
        } catch {
          if (isCurrent) setState("pending")
        }
      }
    }

    void checkPayment()
    return () => {
      isCurrent = false
    }
  }, [reference, attempt])

  if (state === "succeeded") {
    return (
      <div className="space-y-5">
        <p className="text-sm text-emerald-500">Payment confirmed. Your seven-day Desk access is active.</p>
        {subscriptionEndDate && (
          <p className="text-sm text-muted-foreground">
            Access through {new Date(subscriptionEndDate).toLocaleDateString()}.
          </p>
        )}
        <Link href="/desk/feed" className={buttonVariants({ className: "w-full" })}>
          Enter the Desk
        </Link>
      </div>
    )
  }

  if (state === "failed") {
    return (
      <div className="space-y-5">
        <p className="text-sm text-destructive">
          Paystack did not confirm this payment. No Desk access was added.
        </p>
        <Link href="/checkout" className={buttonVariants({ className: "w-full" })}>
          Return to checkout
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {state === "checking" ? "Confirming your Mobile Money payment…" : "Still waiting for payment confirmation…"}
      </p>
      {state === "pending" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Don’t pay again while confirmation is pending. Paystack will update your access when it confirms the transaction.
          </p>
          <button
            type="button"
            className="text-sm font-medium text-primary underline underline-offset-4"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Check again
          </button>
        </div>
      )}
    </div>
  )
}
