import { CreateSetupForm } from "@/components/create-setup-form"
import { MentorContentManager } from "@/components/mentor-content-manager"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export default async function ManageSetupsPage() {
  const user = await getCurrentUser()
  if (!user?.id) return null

  const setups = await db.post.findMany({
    where: { authorId: user.id, type: "TRADE_SETUP" },
    include: { tradeMetadata: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="container max-w-3xl space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Publish Setup</h1>
        <p className="text-muted-foreground">
          Broadcast a new trade setup to the Inner Circle.
        </p>
      </header>
      <CreateSetupForm />
      <section className="space-y-4 border-t pt-8">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Published setups</h2>
          <p className="text-sm text-muted-foreground">Edit levels or remove a setup from the student feed.</p>
        </div>
        <MentorContentManager kind="setups" posts={setups} />
      </section>
    </main>
  )
}
