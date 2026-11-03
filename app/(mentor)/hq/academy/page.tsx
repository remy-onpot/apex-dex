import { notFound } from "next/navigation"

import { CreateLessonForm } from "@/components/create-lesson-form"
import { MentorContentManager } from "@/components/mentor-content-manager"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export default async function ManageAcademyPage() {
  const user = await getCurrentUser()
  if (!user?.id) notFound()

  const author = await db.user.findUnique({ where: { id: user.id }, select: { role: true } })
  if (author?.role !== "MENTOR") notFound()

  const lessons = await db.post.findMany({
    where: { authorId: user.id, type: "LESSON" },
    include: { tradeMetadata: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="container max-w-3xl space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Publish a Lesson</h1>
        <p className="text-muted-foreground">Share core concepts, playbooks, and mentor notes.</p>
      </header>
      <CreateLessonForm />
      <section className="space-y-4 border-t pt-8">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Published lessons</h2>
          <p className="text-sm text-muted-foreground">Keep Academy material accurate and current.</p>
        </div>
        <MentorContentManager kind="lessons" posts={lessons} />
      </section>
    </main>
  )
}
