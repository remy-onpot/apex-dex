import * as React from "react"

import { cn } from "@/lib/utils"
import Link from "next/link"

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className)}>
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-between gap-6 border-t border-white/10 bg-zinc-950 px-6 py-8 text-zinc-400 sm:flex-row sm:items-center md:px-10">
        <div>
          <Link href="/" className="font-heading text-lg font-semibold tracking-tight text-zinc-100">APEX DESK</Link>
          <p className="mt-1 text-xs">Market insight. Better conversations.</p>
        </div>
        <nav className="flex gap-5 text-sm" aria-label="Footer navigation">
          <Link href="/membership" className="hover:text-white">Membership</Link>
          <Link href="/login" className="hover:text-white">Sign in</Link>
        </nav>
        <p className="text-xs">© {new Date().getFullYear()} Apex Desk</p>
      </div>
    </footer>
  )
}
