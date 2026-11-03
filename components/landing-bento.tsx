"use client"

import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
}

const cardClass =
  "rounded-sm bg-background/50 border border-border/50 backdrop-blur-md p-6 md:p-8"

export function LandingBento() {
  return (
    <main className="dark min-h-[calc(100vh-5rem)] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/50 via-background to-background px-2 py-12 text-foreground md:py-20">
      <motion.section
        aria-label="Apex Desk membership"
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto p-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.article
          className={`${cardClass} flex flex-col justify-between md:col-span-2 md:row-span-2`}
          variants={itemVariants}
        >
          <div>
            <p className="mb-6 font-mono text-xs font-bold uppercase tracking-[0.24em] text-lime-400">
              Apex Desk / Private Trading Floor
            </p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
              Stop gambling. Copy the alpha.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              A focused mentor-led trading desk for structured setups, deliberate execution, and chart review.
              setups, strict risk management, and brutal chart reviews.
            </p>
          </div>
          <Link href="/login" className="mt-10 w-fit">
            <Button size="lg" className="h-auto min-h-12 rounded-sm px-6 py-4 font-black uppercase tracking-wide">
              Join the desk - GH₵100 / week
            </Button>
          </Link>
        </motion.article>

        <motion.article className={`${cardClass} flex flex-col`} variants={itemVariants}>
          <p className="text-2xl font-black uppercase tracking-tighter">
            100% signal. 0% noise.
          </p>
          <div className="mt-7 border border-border/60 bg-black/40 p-4 font-mono text-sm">
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3">
              <span className="font-bold text-foreground">XAUUSD</span>
              <span className="text-xs text-muted-foreground">LONG SETUP</span>
            </div>
            <dl className="grid grid-cols-2 gap-y-2 text-muted-foreground">
              <dt>ENTRY</dt><dd className="text-right text-lime-400">2,318.40</dd>
              <dt>TAKE PROFIT</dt><dd className="text-right text-lime-400">2,344.00</dd>
              <dt>STOP LOSS</dt><dd className="text-right text-rose-400">2,307.20</dd>
            </dl>
          </div>
          <p className="mt-auto pt-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Illustrative setup / Risk is yours
          </p>
        </motion.article>

        <motion.article className={cardClass} variants={itemVariants}>
          <p className="mb-4 font-mono text-xs font-bold uppercase tracking-[0.2em] text-lime-400">
            No soft feedback
          </p>
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">
            Brutal chart reviews.
          </h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Submit your markups. We strip away your bad habits and fix your thesis
            before you blow your funded account.
          </p>
          <div className="mt-6 border border-border/60 bg-black/40 p-3" aria-label="Illustrative XAUUSD candlestick chart">
            <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3 font-mono text-[10px] font-bold uppercase tracking-widest">
              <span className="text-foreground">XAU / USD</span>
              <span className="text-muted-foreground">4H Â· Structure</span>
            </div>
            <svg viewBox="0 0 372 210" role="img" aria-label="Illustrative candlestick chart with planned entry and invalidation levels" className="block w-full">
              {[34, 74, 114, 154, 194].map((y) => <line key={`h${y}`} x1="4" x2="368" y1={y} y2={y} stroke="currentColor" className="text-slate-800" />)}
              {[82, 162, 242, 322].map((x) => <line key={`v${x}`} x1={x} x2={x} y1="12" y2="198" stroke="currentColor" className="text-slate-800/70" />)}
              <line x1="4" x2="368" y1="104" y2="104" stroke="#c7ff3d" strokeDasharray="4 5" />
              <line x1="4" x2="368" y1="157" y2="157" stroke="#fb7185" strokeDasharray="4 5" />
              <text x="360" y="99" textAnchor="end" fill="#c7ff3d" fontSize="7" fontFamily="monospace">ENTRY</text>
              <text x="360" y="151" textAnchor="end" fill="#fb7185" fontSize="7" fontFamily="monospace">INVALIDATION</text>
              {[[28,155,129,116,166],[54,129,143,118,154],[80,144,113,103,153],[106,113,124,101,136],[132,125,99,89,134],[158,99,110,87,120],[184,111,80,70,121],[210,80,92,65,104],[236,92,61,52,101],[262,62,75,46,87],[288,75,47,38,89],[314,47,58,29,69],[340,58,34,23,70]].map(([x, open, close, high, low]) => {
                const bullish = close < open
                const color = bullish ? "#a3e6b0" : "#fb7185"
                return <g key={x} stroke={color} fill={color}><line x1={x + 6} x2={x + 6} y1={high} y2={low} strokeWidth="1.5" /><rect x={x} y={Math.min(open, close)} width="12" height={Math.max(4, Math.abs(close - open))} rx="1" /></g>
              })}
              <path d="M34 180 C70 165 85 173 112 139 S163 130 188 108 S238 110 264 77 S311 66 349 27" fill="none" stroke="#f1f5f9" strokeOpacity=".5" strokeWidth="1.5" />
              <circle cx="349" cy="27" r="3" fill="#c7ff3d" />
            </svg>
            <div className="mt-2 flex justify-between border-t border-border/50 pt-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              <span>XAUUSD / Study 014</span><span>Illustrative only Â· not a live signal</span>
            </div>
          </div>
        </motion.article>

        <motion.article
          className={`${cardClass} flex flex-col justify-between md:col-span-2`}
          variants={itemVariants}
        >
          <p className="max-w-3xl text-3xl font-black uppercase tracking-tighter md:text-5xl">
            Trade like a desk, not a retail trader.
          </p>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t border-border/60 pt-5 sm:flex-row sm:items-center">
            <p className="text-muted-foreground">
              Everything you need to execute. Nothing you don&apos;t.
            </p>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-lime-400">
              Ghana / Global Markets
            </span>
          </div>
        </motion.article>
      </motion.section>

      <motion.section
        aria-labelledby="arsenal-heading"
        className="mx-auto max-w-6xl px-6 py-24 md:py-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-12 flex flex-col justify-between gap-5 border-b border-border/50 pb-7 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-lime-400">Membership / What&apos;s inside</p>
            <h2 id="arsenal-heading" className="text-4xl font-black uppercase tracking-tighter md:text-5xl">What you are paying for.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground">A working process, direct feedback, and a place to review the decision before and after the trade.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01. The feed", "Institutional trade setups with exact entries, stops, and targets. No ambiguous signals."],
            ["02. The review", "Submit your charts. We tear down your thesis and fix your execution before you blow another funded account."],
            ["03. The academy", "Playbooks and risk-management models built around a repeatable process. Study the rules. Apply them yourself."],
          ].map(([title, description]) => (
            <article key={title} className="group flex min-h-72 flex-col border border-border/50 bg-background/80 p-7 backdrop-blur transition-colors hover:border-border md:p-8">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-lime-400">Apex / Field Manual</span>
              <h3 className="mt-auto pt-16 text-2xl font-black uppercase tracking-tight">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-y border-border/40 py-5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <span><b className="mr-2 text-lime-400">+</b>Live market context</span>
          <span><b className="mr-2 text-lime-400">+</b>Defined risk before entry</span>
          <span><b className="mr-2 text-lime-400">+</b>Weekly review cadence</span>
          <span><b className="mr-2 text-lime-400">+</b>One mentor. One broadcast.</span>
        </div>
      </motion.section>

      <motion.section
        aria-labelledby="reality-heading"
        className="border-y border-border/50 bg-black/30 py-24 md:py-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">Pick your operating mode</p>
          <h2 id="reality-heading" className="mb-12 text-4xl font-black uppercase tracking-tighter md:text-5xl">The reality.</h2>
          <div className="grid gap-px border border-border/40 bg-border/40 md:grid-cols-2">
            <div className="bg-background p-7 md:p-10">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-red-500/80">Retail / Same old cycle</p>
              <ul className="mt-8 space-y-5 text-lg font-bold uppercase tracking-tight text-muted-foreground">
                {["Revenge trading", "Telegram noise", "Changing strategies weekly", "Blown accounts"].map((item) => <li key={item} className="flex gap-4"><span className="text-red-500/80">−</span>{item}</li>)}
              </ul>
            </div>
            <div className="bg-background p-7 md:p-10">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-green-500/80">The desk / A defined process</p>
              <ul className="mt-8 space-y-5 text-lg font-bold uppercase tracking-tight text-foreground">
                {["Mechanical execution", "Strict risk parameters", "Weekly reviews", "Capital preservation"].map((item) => <li key={item} className="flex gap-4"><span className="text-green-500/80">+</span>{item}</li>)}
              </ul>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-xs leading-6 text-muted-foreground">A process can improve how you make decisions. It cannot remove market risk or guarantee a profitable trade.</p>
        </div>
      </motion.section>

      <motion.section
        aria-label="Membership details"
        className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-[1fr_auto] md:items-center md:py-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <p className="mb-3 font-mono text-xs font-bold uppercase tracking-[0.22em] text-lime-400">Membership / Weekly access</p>
          <h2 className="max-w-2xl text-4xl font-black uppercase tracking-tighter md:text-6xl">One week. One process. No excuses.</h2>
          <p className="mt-5 max-w-xl leading-7 text-muted-foreground">Get mentor broadcasts, structured setups, chart reviews, and the Academy for one weekly membership. Come in, do the work, decide if the desk earns another week.</p>
        </div>
        <div className="min-w-64 border border-border/60 bg-background/70 p-6 backdrop-blur">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Inner Circle / Weekly</p>
          <p className="mt-4 text-4xl font-black tracking-tighter">GH₵ 100<span className="text-sm font-bold tracking-normal text-muted-foreground"> / week</span></p>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">Payment and renewal details are shown at checkout.</p>
          <Link href="/login" className="mt-6 block">
            <Button size="lg" className="w-full rounded-sm font-black uppercase">Get access</Button>
          </Link>
        </div>
      </motion.section>

      <motion.section
        aria-labelledby="final-cta-heading"
        className="border-t border-border/50 bg-lime-400 px-6 py-24 text-zinc-950 md:py-32"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 font-mono text-xs font-black uppercase tracking-[0.24em]">Apex Desk / Your move</p>
          <h2 id="final-cta-heading" className="text-6xl font-black uppercase leading-[0.88] tracking-tighter md:text-8xl">Execute or exit.</h2>
          <div className="mt-9 flex flex-col items-start justify-between gap-7 border-t border-zinc-950/20 pt-7 md:flex-row md:items-center">
            <p className="max-w-xl text-lg font-medium leading-7">The Inner Circle is GH₵ 100/week. If you can&apos;t manage that risk, you shouldn&apos;t be trading.</p>
            <Link href="/login">
              <Button size="lg" className="h-14 rounded-sm bg-zinc-950 px-8 text-base font-black uppercase text-lime-300 hover:bg-zinc-800">Enter the Inner Circle </Button>
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
