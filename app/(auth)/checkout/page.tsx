import Link from "next/link"
import { redirect } from "next/navigation"

import { CheckoutButton } from "@/components/checkout-button"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { weeklyPass } from "@/config/membership"
import { getCurrentUser } from "@/lib/session"
import { getSubscriptionStatus, getSubscriptionUser } from "@/lib/subscription"
import { isPaystackConfigured } from "@/lib/paystack"

export const metadata = {
  title: "Join Apex Desk",
  description: "Get seven days of mentor-led trading setups, chart reviews, and Academy access.",
}

export default async function CheckoutPage() {
  const sessionUser = await getCurrentUser()
  const user = sessionUser?.id ? await getSubscriptionUser(sessionUser.id) : null

  if (sessionUser?.id && !user) redirect("/login?from=%2Fcheckout")
  if (user?.role === "MENTOR") redirect("/hq")

  const status = user ? getSubscriptionStatus(user) : null
  const checkoutReady = isPaystackConfigured() && Boolean(user?.email)

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 px-4 py-12 text-zinc-100 sm:px-6 lg:py-20">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lime-400/10 via-zinc-950 to-zinc-950" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-20">
        <section className="space-y-8">
          <Link href="/" className="font-mono text-sm font-bold uppercase tracking-[0.24em] text-lime-300">
            Apex Desk / Private Trading Floor
          </Link>
          <div className="space-y-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.22em] text-lime-300">
              The next setup won’t wait
            </p>
            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.95] tracking-tighter sm:text-6xl lg:text-7xl">
              Be ready before the market moves.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-300">
              Enter a focused, mentor-led process: structured trade plans, defined risk, direct chart review, and a field manual you can study between setups.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["01 / Broadcast", "Asset, entry, stop, target, and live status from the mentor."],
              ["02 / Crucible", "Submit your chart and thesis. Get direct execution feedback."],
              ["03 / Academy", "Risk models and playbooks kept separate from the live feed."],
            ].map(([title, description]) => (
              <article key={title} className="border border-white/10 bg-white/[0.03] p-4">
                <p className="font-mono text-xs font-bold uppercase tracking-wider text-lime-300">{title}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{description}</p>
              </article>
            ))}
          </div>

          <div className="border-l-2 border-lime-300 pl-4">
            <p className="font-semibold">The mentor broadcasts when a setup is ready.</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
              If you join after an entry has moved, you may miss that setup. There are no fake seat counters or promised returns here—only a clear process and a weekly access window.
            </p>
          </div>
          <p className="max-w-2xl text-xs leading-5 text-zinc-500">
            Trading involves risk, including loss of capital. Membership provides education and structured analysis, not guaranteed signals or financial advice.
          </p>
        </section>

        <Card className="border-white/15 bg-zinc-900/90 text-zinc-100 shadow-2xl shadow-black/40 backdrop-blur">
          <CardHeader className="space-y-4">
            {status === "active" ? (
              <Badge className="w-fit bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/15">ACCESS ACTIVE</Badge>
            ) : status === "expired" ? (
              <Badge variant="destructive" className="w-fit">ACCESS EXPIRED</Badge>
            ) : (
              <Badge className="w-fit bg-lime-300 text-zinc-950 hover:bg-lime-300">7-DAY DESK PASS</Badge>
            )}
            <CardTitle className="text-2xl">
              {status === "active"
                ? "Your pass is live."
                : status === "expired"
                  ? "Your access ended."
                  : status === "inactive"
                    ? "Restore your access."
                    : "Get inside the Desk."}
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {status === "active"
                ? "Stay in the flow or add another week to your current access."
                : status === "expired"
                  ? `Your previous access ended ${user?.subscriptionEndDate?.toLocaleDateString()}. Renew to return to the Desk.`
                  : "One week of mentor broadcasts, chart reviews, and Academy access."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-y border-white/10 py-5">
              <p className="text-4xl font-black tracking-tight">
                GH₵ {weeklyPass.amountGhs}
                <span className="ml-2 text-sm font-medium text-zinc-400">/ 7 days</span>
              </p>
              <p className="mt-2 text-xs text-zinc-500">One-time weekly pass. No automatic charge or annual lock-in.</p>
            </div>

            {status === "active" && user?.subscriptionEndDate && (
              <p className="text-sm text-zinc-300">
                Current access through <strong>{user.subscriptionEndDate.toLocaleDateString()}</strong>.
              </p>
            )}

            {!user ? (
              <Link href="/login?from=%2Fcheckout" className={buttonVariants({ size: "lg", className: "w-full bg-lime-300 font-bold text-zinc-950 hover:bg-lime-200" })}>
                Sign in to continue
              </Link>
            ) : checkoutReady ? (
              <CheckoutButton
                label={status === "active" ? "Add 7 days — GH₵100" : "Start my week — GH₵100"}
              />
            ) : (
              <div className="border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
                {!user.email
                  ? "Add an email address to your account before starting checkout."
                  : "Mobile Money checkout is being connected. This page will not charge you until checkout is enabled."}
              </div>
            )}

            <p className="text-center text-xs leading-5 text-zinc-500">
              Access begins after Paystack confirms payment and lasts seven days. Renew whenever you choose.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
