import { db } from "@/lib/db"

export type UserSubscriptionPlan = {
  isPremium: boolean
  subscriptionEndDate: Date | null
  isCanceled: false
  name: "Weekly Pass"
  description: "Apex Desk Access"
}

export async function getUserSubscriptionPlan(
  userId: string
): Promise<UserSubscriptionPlan> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, subscriptionEndDate: true },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return {
    isPremium: user.isPremium,
    subscriptionEndDate: user.subscriptionEndDate,
    isCanceled: false,
    name: "Weekly Pass",
    description: "Apex Desk Access",
  }
}
