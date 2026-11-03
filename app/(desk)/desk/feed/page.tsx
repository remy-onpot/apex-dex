import Link from "next/link"

import { FeedUpdateCard } from "@/components/feed-update-card"
import { LiveFeedRefresher } from "@/components/live-feed-refresher"
import { TradeCard } from "@/components/trade-card"
import { Button } from "@/components/ui/button"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export default async function FeedPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const posts = await db.post.findMany({
    where: {
      published: true,
      type: { in: ["TRADE_SETUP", "ANNOUNCEMENT"] },
    },
    include: {
      author: { select: { name: true } },
      tradeMetadata: true,
      readReceipts: { where: { userId: user.id }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="container max-w-4xl space-y-8 py-8">
      <LiveFeedRefresher />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Feed</h1>
          <p className="text-muted-foreground">Market notes and trade setups from your mentor.</p>
        </div>
        {user.role === "MENTOR" && (
          <Button asChild>
            <Link href="/hq/announcements">Post an update</Link>
          </Button>
        )}
      </header>
      {posts.length ? (
        <div className="space-y-5">
          {posts.map((post) =>
            post.type === "TRADE_SETUP" ? (
              <TradeCard
                key={post.id}
                post={post}
                isUnread={post.readReceipts.length === 0}
              />
            ) : (
              <FeedUpdateCard key={post.id} post={post} />
            )
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No updates yet. Your mentor&apos;s market notes and setups will show up here.
        </div>
      )}
    </main>
  )
}
