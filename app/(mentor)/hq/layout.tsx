import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"

const mentorLinks = [
  { href: "/hq", label: "Dashboard" },
  { href: "/hq/announcements", label: "Post an Update" },
  { href: "/hq/setups", label: "Publish Setups" },
  { href: "/hq/academy", label: "Publish Lessons" },
  { href: "/hq/reviews", label: "Pending Chart Reviews" },
]

interface MentorLayoutProps {
  children: React.ReactNode
}

export default async function MentorLayout({ children }: MentorLayoutProps) {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== "MENTOR") {
    redirect("/desk/setups")
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 shrink-0 border-r p-6">
        <Link href="/hq" className="mb-8 block text-lg font-semibold">
          Mentor HQ
        </Link>
        <nav aria-label="Mentor navigation" className="grid gap-2">
          {mentorLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
