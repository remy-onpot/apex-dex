import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: { reviewId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
    typeof body.feedback !== "string"
  ) {
    return NextResponse.json(
      { error: "Feedback must be a string" },
      { status: 400 }
    )
  }

  try {
    const submission = await db.chartSubmission.update({
      where: { id: params.reviewId },
      data: { feedback: body.feedback, status: "REVIEWED" },
    })

    return NextResponse.json(submission)
  } catch {
    return NextResponse.json(
      { error: "Unable to update chart review" },
      { status: 500 }
    )
  }
}
