import { GradeChartForm } from "@/components/grade-chart-form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/db"

export default async function ManageReviewsPage() {
  const submissions = await db.chartSubmission.findMany({
    where: { status: "PENDING" },
    include: { student: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  })

  return (
    <main className="container space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Pending Reviews</h1>
        <p className="text-muted-foreground">
          Grade student chart submissions.
        </p>
      </header>
      {submissions.length ? (
        <div className="space-y-5">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <CardTitle>
                  {`${submission.student.name || "Student"}'s chart submission`}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Submitted {submission.createdAt.toLocaleDateString()}
                </p>
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
                    className="max-h-[32rem] w-full object-contain"
                  />
                </a>
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold">Trade thesis</h2>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                    {submission.thesis}
                  </p>
                </div>
                <GradeChartForm reviewId={submission.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No pending chart reviews.
        </div>
      )}
    </main>
  )
}
