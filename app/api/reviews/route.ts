import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getSubscriptionUser, logInactiveSubscriptionAdvisory } from "@/lib/subscription"
import { chartSubmissionSchema } from "@/lib/validations/review"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const dbUser = await getSubscriptionUser(session.user.id)
  if (!dbUser) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }
  if (dbUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  logInactiveSubscriptionAdvisory(session.user.id, dbUser)
  // TODO(Phase 6): enable the 403 after Paystack sandbox cases pass.
  // if (!hasActiveSubscription(dbUser)) return NextResponse.json({ error: "Active subscription required" }, { status: 403 })

  try {
    const body = chartSubmissionSchema.parse(await request.json())
    const submission = await db.chartSubmission.create({
      data: {
        imageUrl: body.imageUrl,
        thesis: body.thesis,
        studentId: session.user.id,
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 })
    }

    return NextResponse.json(
      { error: "Unable to submit chart for review" },
      { status: 500 }
    )
  }
}
