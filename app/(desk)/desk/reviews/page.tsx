import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

export default async function ReviewsPage() {
  const user = await getCurrentUser()
  if (!user) return null

  const submissions = await db.chartSubmission.findMany({
    where:
      user.role === "STUDENT"
        ? {
            OR: [
              { status: "GRADED" },
              { status: "PENDING", studentId: user.id },
            ],
          }
        : { status: "GRADED" },
    include: { student: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="container space-y-8 py-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Chart Reviews</h1>
          <p className="text-muted-foreground">
            Chart submissions and mentor feedback.
          </p>
        </div>
        {user.role === "STUDENT" && (
          <Link href="/desk/reviews/submit" className={buttonVariants()}>
            Submit a chart
          </Link>
        )}
      </header>

      {submissions.length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                <div className="space-y-1">
                  <CardTitle>{submission.student.name || "Student"}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {submission.createdAt.toLocaleDateString()}
                  </p>
                </div>
                {submission.status === "PENDING" && (
                  <Badge variant="secondary">Awaiting Mentor Review</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-5">
                <a
                  href={submission.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-md border"
                >
                  <img
                    src={submission.imageUrl}
                    alt={`${submission.student.name || "Student"}'s chart submission`}
                    className="max-h-96 w-full object-contain"
                  />
                </a>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold">Trade thesis</h2>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {submission.thesis}
                  </p>
                </div>
                {submission.status === "GRADED" && (
                  <section className="space-y-2 rounded-md border border-primary/20 bg-muted/70 p-4">
                    <h2 className="text-sm font-semibold">Mentor feedback</h2>
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {submission.feedback || "No feedback provided."}
                    </p>
                  </section>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No chart submissions yet. Share a chart to get started.
        </div>
      )}
    </main>
  )
}
