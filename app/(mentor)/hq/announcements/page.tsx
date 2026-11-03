import { CreateFeedUpdateForm } from "@/components/create-feed-update-form"

export default function AnnouncementsPage() {
  return (
    <main className="container max-w-3xl space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Post an Update</h1>
        <p className="text-muted-foreground">
          Share a quick market note or attach chart images. Students see it in their feed.
        </p>
      </header>
      <CreateFeedUpdateForm />
    </main>
  )
}
