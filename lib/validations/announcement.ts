import * as z from "zod"

export const announcementSchema = z.object({
  text: z.string().trim().min(1).max(5000),
  imageUrls: z.array(z.string().url()).max(6).optional(),
})
