import { formatDistanceToNow } from "date-fns"
import type { Prisma } from "@prisma/client"

import { Badge } from "@/components/ui/badge"
import { MarkReadButton } from "@/components/mark-read-button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type TradePost = Prisma.PostGetPayload<{
  include: { tradeMetadata: true; readReceipts: { select: { id: true } } }
}>

function getPostText(content: TradePost["content"]) {
  if (typeof content === "string") return content
  if (!content || typeof content !== "object") return null

  const data = content as { blocks?: Array<{ type?: string; data?: { text?: string } }> }
  const text = data.blocks
    ?.filter((block) => block.type === "paragraph" || block.type === "header")
    .map((block) => block.data?.text)
    .filter((value): value is string => Boolean(value))
    .join("\n\n")

  return text || null
}

export function TradeCard({ post, isUnread }: { post: TradePost; isUnread: boolean }) {
  const trade = post.tradeMetadata
  const isBuy = trade?.direction.toUpperCase() === "BUY"
  const analysis = getPostText(post.content)
  const imageUrls = Array.isArray(post.imageUrls)
    ? post.imageUrls.filter((url): url is string => typeof url === "string")
    : []

  return (
    <Card className={isUnread ? "overflow-hidden border-primary/50" : "overflow-hidden"}>
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl">{trade?.asset ?? post.title}</CardTitle>
          <p className="text-sm text-muted-foreground">Trade setup</p>
        </div>
        {trade && (
          <Badge
            className={
              isBuy
                ? "border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                : "border-transparent bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {trade.direction.toUpperCase()}
          </Badge>
        )}
        {isUnread && <Badge variant="outline" className="border-primary/40 text-primary">UNREAD</Badge>}
      </CardHeader>
      <CardContent className="space-y-5">
        {trade && (
          <dl className="grid grid-cols-2 gap-3 rounded-md bg-muted/50 p-4 sm:grid-cols-4">
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Entry price</dt>
              <dd className="font-medium">{trade.entryPrice}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Stop loss</dt>
              <dd className="font-medium">{trade.stopLoss}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Take profit</dt>
              <dd className="font-medium">{trade.takeProfit}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="font-medium">{trade.status}</dd>
            </div>
          </dl>
        )}
        {analysis && (
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {analysis}
          </p>
        )}
        {imageUrls.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {imageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`Chart for ${trade?.asset ?? post.title}`}
                loading="lazy"
                className="max-h-[32rem] w-full rounded-md border border-border object-contain"
              />
            ))}
          </div>
        )}
        {isUnread && <MarkReadButton postId={post.id} />}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  )
}
