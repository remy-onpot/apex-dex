import * as z from "zod"

export const setupSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  asset: z.string().min(2),
  direction: z.enum(["BUY", "SELL"]),
  entryPrice: z.string().min(1),
  stopLoss: z.string().min(1),
  takeProfit: z.string().min(1),
  imageUrls: z.array(z.string().url()).max(6).optional(),
})
