import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { chartSubmissionSchema } from "@/lib/validations/review"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
