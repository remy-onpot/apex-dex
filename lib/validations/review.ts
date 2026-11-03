import * as z from "zod"

export const chartSubmissionSchema = z.object({
  imageUrl: z.string().url(),
  thesis: z.string().min(10),
})
