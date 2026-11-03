import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function lessonText(content: unknown) {
  if (typeof content === "string") return content
  if (!content || typeof content !== "object") return ""
  const data = content as { blocks?: Array<{ type?: string; data?: { text?: string } }> }
  return data.blocks
    ?.filter((block) => block.type === "paragraph" || block.type === "header")
    .map((block) => block.data?.text)
    .filter((text): text is string => Boolean(text))
    .join("\n\n") ?? ""
}

export default async function AcademyPage() {
  const lessons = await db.post.findMany({
    where: { type: "LESSON" },
    orderBy: { createdAt: "desc" },
  })

  return (
    <main className="container space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Academy</h1>
        <p className="text-muted-foreground">Core concepts, playbooks, and mentor notes.</p>
      </header>
      {lessons.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {lessons.map((lesson) => (
            <Card key={lesson.id}>
              <CardHeader><CardTitle>{lesson.title}</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{lessonText(lesson.content) || "No lesson content."}</p>
                {Array.isArray(lesson.imageUrls) && lesson.imageUrls.length > 0 && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {lesson.imageUrls.filter((url): url is string => typeof url === "string").map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} src={url} alt={`Image for ${lesson.title}`} loading="lazy" className="max-h-[32rem] w-full rounded-md border border-border object-contain" />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No lessons published yet.</div>
      )}
    </main>
  )
}
