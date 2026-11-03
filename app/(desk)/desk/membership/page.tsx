import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import { getUserSubscriptionPlan } from "@/lib/subscription"
import { BillingForm } from "@/components/billing-form"

export const metadata = {
  title: "Membership",
  description: "View your Apex Desk membership status.",
}

export default async function MembershipPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const subscriptionPlan = await getUserSubscriptionPlan(user.id)

  return (
    <main className="container space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-semibold">Membership</h1>
        <p className="text-muted-foreground">View your access status.</p>
      </header>
      <BillingForm subscriptionPlan={subscriptionPlan} />
    </main>
  )
}
