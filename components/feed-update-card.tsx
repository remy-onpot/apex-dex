import { formatDistanceToNow } from "date-fns"
import type { Prisma } from "@prisma/client"

import { PostComments } from "@/components/post-comments"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type FeedUpdate = Prisma.PostGetPayload<{
  include: {
    author: { select: { name: true } }
    comments: { include: { author: { select: { name: true } } } }
  }
}>

function getImageUrls(value: Prisma.JsonValue) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

export function FeedUpdateCard({ post }: { post: FeedUpdate }) {
  const imageUrls = getImageUrls(post.imageUrls)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <p className="font-semibold">{post.author.name || "Mentor"}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </p>
        </div>
        <Badge variant="secondary">Mentor update</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {typeof post.content === "string" && (
          <p className="whitespace-pre-wrap text-sm leading-7">{post.content}</p>
        )}
        {imageUrls.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {imageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt="Image attached to mentor update"
                loading="lazy"
                className="max-h-[32rem] w-full rounded-md border border-border object-contain"
              />
            ))}
          </div>
        )}
        <PostComments postId={post.id} initialComments={post.comments} />
      </CardContent>
    </Card>
  )
}
