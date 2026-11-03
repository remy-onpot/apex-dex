import { db } from "@/lib/db"
import { TradeCard } from "@/components/trade-card"
import { LiveFeedRefresher } from "@/components/live-feed-refresher"
import { getCurrentUser } from "@/lib/session"

export default async function SetupsPage() {
  const user = await getCurrentUser()

  if (!user) return null

  const posts = await db.post.findMany({
    where: { type: "TRADE_SETUP", published: true },
    include: {
      tradeMetadata: true,
      readReceipts: { where: { userId: user.id }, select: { id: true } },
      comments: { include: { author: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="container space-y-8 py-8">
      <LiveFeedRefresher />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Trade Setups</h1>
        <p className="text-muted-foreground">
          Live institutional market setups.
        </p>
      </header>
      {posts.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {posts.map((post) => (
            <TradeCard key={post.id} post={post} isUnread={post.readReceipts.length === 0} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No active setups. Waiting for the mentor to publish.
        </div>
      )}
    </main>
  )
}
