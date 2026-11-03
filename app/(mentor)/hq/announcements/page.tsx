import { CreateFeedUpdateForm } from "@/components/create-feed-update-form"
import { MentorContentManager } from "@/components/mentor-content-manager"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export default async function AnnouncementsPage() {
  const user = await getCurrentUser()
  if (!user?.id) return null

  const announcements = await db.post.findMany({
    where: { authorId: user.id, type: "ANNOUNCEMENT" },
    include: { tradeMetadata: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="container max-w-3xl space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Post an Update</h1>
        <p className="text-muted-foreground">
          Share a quick market note or attach chart images. Students see it in their feed.
        </p>
      </header>
      <CreateFeedUpdateForm />
      <section className="space-y-4 border-t pt-8">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Published updates</h2>
          <p className="text-sm text-muted-foreground">Edit or remove a mentor broadcast.</p>
        </div>
        <MentorContentManager kind="announcements" posts={announcements} />
      </section>
    </main>
  )
}
