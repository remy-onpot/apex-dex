import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { requireMentor } from "@/lib/mentor-auth"

export async function PATCH(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  const auth = await requireMentor()
  if ("response" in auth) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("feedback" in body) ||
    typeof body.feedback !== "string" ||
    !body.feedback.trim() ||
    body.feedback.trim().length > 10000
  ) {
    return NextResponse.json(
      { error: "Feedback must be a string" },
      { status: 400 }
    )
  }
  const feedback = (body as { feedback: string }).feedback.trim()

  try {
    const submission = await db.$transaction(async (transaction) => {
      const result = await transaction.chartSubmission.updateMany({
        where: { id: params.reviewId, status: "PENDING" },
        data: { feedback, status: "GRADED" },
      })
      if (result.count === 0) return null

      return transaction.chartSubmission.findUnique({
        where: { id: params.reviewId },
        include: { student: { select: { id: true, name: true } } },
      })
    })
    if (!submission) {
      return NextResponse.json({ error: "Pending chart review not found" }, { status: 404 })
    }

    return NextResponse.json(submission)
  } catch {
    return NextResponse.json(
      { error: "Unable to update chart review" },
      { status: 500 }
    )
  }
}
