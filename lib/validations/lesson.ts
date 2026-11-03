import * as z from "zod"

export const lessonSchema = z.object({
  title: z.string().trim().min(3).max(160),
  content: z.string().trim().min(1).max(20000),
  imageUrls: z.array(z.string().url()).max(6).optional(),
})
