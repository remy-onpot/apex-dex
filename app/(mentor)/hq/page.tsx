import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { db } from "@/lib/db"

const quickLinks = [
  {
    href: "/hq/setups",
    title: "Publish a setup",
    description: "Share a new trade idea with students.",
  },
  {
    href: "/hq/academy",
    title: "Publish a lesson",
    description: "Add learning material to the academy.",
  },
  {
    href: "/hq/reviews",
    title: "Review charts",
    description: "Give feedback on student submissions.",
  },
]

export default async function MentorDashboardPage() {
  const [setups, lessons, pendingReviews, students, recentPosts] =
    await Promise.all([
      db.post.count({ where: { type: "TRADE_SETUP", published: true } }),
      db.post.count({ where: { type: "LESSON", published: true } }),
      db.chartSubmission.count({ where: { status: "PENDING" } }),
      db.user.count({ where: { role: "STUDENT" } }),
      db.post.findMany({
        where: {
          published: true,
          type: { in: ["TRADE_SETUP", "LESSON"] },
        },
        select: { id: true, title: true, type: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
    ])

  const metrics = [
    { label: "Published setups", value: setups },
    { label: "Published lessons", value: lessons },
    { label: "Reviews waiting", value: pendingReviews },
    { label: "Students", value: students },
  ]

  return (
    <main className="container space-y-8 py-8">
      <header className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Mentor HQ</p>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          A quick look at your content and student activity.
        </p>
      </header>

      <section
        aria-label="Mentor activity"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-3xl">{metric.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <p className="text-sm text-muted-foreground">
            Jump straight to your main mentor tasks.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent published content</CardTitle>
          <CardDescription>Recently updated setups and lessons.</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPosts.length ? (
            <ul className="divide-y">
              {recentPosts.map((post) => (
                <li
                  key={post.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {post.type === "TRADE_SETUP" ? "Trade setup" : "Lesson"}
                    </p>
                  </div>
                  <time
                    dateTime={post.updatedAt.toISOString()}
                    className="shrink-0 text-xs text-muted-foreground"
                  >
                    {post.updatedAt.toLocaleDateString()}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing published yet. Use a quick action to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
