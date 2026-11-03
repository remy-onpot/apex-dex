import Link from "next/link"

import { marketingConfig } from "@/config/marketing"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

interface MarketingLayoutProps {
  children: React.ReactNode
}

export default async function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/95 text-zinc-100 backdrop-blur">
        <div className="container flex h-20 items-center justify-between py-6">
          <MainNav items={marketingConfig.mainNav} />
          <nav className="flex items-center gap-5">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-zinc-400 hover:text-white sm:inline"
            >
              Sign in
            </Link>
            <Link href="/checkout" className="inline-flex h-10 items-center rounded-sm bg-lime-400 px-4 text-sm font-bold uppercase tracking-wide text-zinc-950 hover:bg-lime-300">Join Apex Desk</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
