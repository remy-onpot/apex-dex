import Link from "next/link"

export const metadata = {
  title: "Membership | Apex Desk",
  description: "A focused, mentor-led trading desk. GH₵100 for seven days.",
}

const included = [
  "Structured mentor trade setups with entry, stop, and targets",
  "The Academy: playbooks, risk models, and execution lessons",
  "The Crucible: submit chart work and learn from mentor reviews",
  "A quiet, broadcast-first desk built for deliberate execution",
]

export default function PricingPage() {
  return (
    <main className="mx-auto grid min-h-[75vh] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
      <section>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-lime-400">Apex Desk · Ghana</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-black uppercase tracking-tight md:text-7xl">A cleaner process. A sharper desk.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          One mentor-led feed for setups, study, and chart review. No public chat rooms and no promises of profit. You bring the discipline; the desk gives you a structured place to work.
        </p>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
          Trading forex involves substantial risk and losses can exceed expectations. Signals and education are not financial advice or a guarantee of results.
        </p>
      </section>
      <section className="border border-lime-400/30 bg-zinc-950 p-7 shadow-2xl shadow-lime-950/20 md:p-9">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-lime-400">One-week access</p>
        <p className="mt-4 text-5xl font-black">GH₵100</p>
        <p className="mt-1 text-sm text-muted-foreground">7 days · one-time payment · no automatic renewal</p>
        <ul className="mt-8 grid gap-4 text-sm leading-6">
          {included.map((item) => <li key={item} className="flex gap-3"><span className="text-lime-400">+</span><span>{item}</span></li>)}
        </ul>
        <Link href="/checkout" className="mt-9 flex min-h-12 items-center justify-center bg-lime-400 px-5 text-sm font-black uppercase tracking-wide text-zinc-950 transition-colors hover:bg-lime-300">
          See access options
        </Link>
        <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">Access starts after the payment provider confirms your payment. Renew each week when you choose.</p>
      </section>
    </main>
  )
}
