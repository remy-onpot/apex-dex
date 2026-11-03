import Link from "next/link"
import { redirect } from "next/navigation"

import { PaymentReturnWatcher } from "@/components/payment-return-watcher"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export const metadata = {
  title: "Confirming payment",
}

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams?: { reference?: string }
}) {
  const sessionUser = await getCurrentUser()
  if (!sessionUser?.id) redirect("/login?from=%2Fcheckout")

  const reference = searchParams?.reference
  const payment = reference
    ? await db.payment.findFirst({
        where: { reference, userId: sessionUser.id, provider: "PAYSTACK" },
        select: { id: true },
      })
    : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Payment confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          {reference && payment ? (
            <PaymentReturnWatcher reference={reference} />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We couldn’t find a checkout linked to this account.
              </p>
              <Link href="/checkout" className={buttonVariants({ className: "w-full" })}>
                Return to checkout
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
