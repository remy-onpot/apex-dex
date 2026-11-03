import type { UserRole } from "@prisma/client"

import { db } from "@/lib/db"

export type SubscriptionUser = {
  role: UserRole
  email: string | null
  isPremium: boolean
  subscriptionEndDate: Date | null
}

export type SubscriptionStatus = "active" | "expired" | "never_subscribed" | "inactive"

export type UserSubscriptionPlan = {
  isPremium: boolean
  isActive: boolean
  status: SubscriptionStatus
  subscriptionEndDate: Date | null
  isCanceled: false
  name: "Weekly Pass"
  description: "Apex Desk Access"
}

export function hasActiveSubscription(
  user: Pick<SubscriptionUser, "isPremium" | "subscriptionEndDate">,
  now: Date = new Date()
) {
  return Boolean(
    user.isPremium &&
      user.subscriptionEndDate &&
      user.subscriptionEndDate.getTime() > now.getTime()
  )
}

export function logInactiveSubscriptionAdvisory(
  userId: string,
  user: Pick<SubscriptionUser, "email" | "isPremium" | "subscriptionEndDate">
) {
  if (!hasActiveSubscription(user)) {
    console.warn(
      `[Phase 6 Advisory] User ${userId} (${user.email ?? "no email"}) is expired or inactive. Target: /checkout`
    )
  }
}

export function getSubscriptionStatus(
  user: Pick<SubscriptionUser, "isPremium" | "subscriptionEndDate">,
  now: Date = new Date()
): SubscriptionStatus {
  if (hasActiveSubscription(user, now)) return "active"
  if (!user.isPremium && user.subscriptionEndDate === null) return "never_subscribed"
  if (user.subscriptionEndDate && user.subscriptionEndDate.getTime() <= now.getTime()) {
    return "expired"
  }
  return "inactive"
}

export async function getSubscriptionUser(
  userId: string
): Promise<SubscriptionUser | null> {
  return db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      email: true,
      isPremium: true,
      subscriptionEndDate: true,
    },
  })
}

export async function getUserSubscriptionPlan(
  userId: string
): Promise<UserSubscriptionPlan> {
  const user = await getSubscriptionUser(userId)

  if (!user) {
    throw new Error("User not found")
  }

  return {
    isPremium: user.isPremium,
    isActive: hasActiveSubscription(user),
    status: getSubscriptionStatus(user),
    subscriptionEndDate: user.subscriptionEndDate,
    isCanceled: false,
    name: "Weekly Pass",
    description: "Apex Desk Access",
  }
}
