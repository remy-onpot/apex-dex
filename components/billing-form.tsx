import type { UserSubscriptionPlan } from "@/lib/subscription"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type BillingFormProps = {
  subscriptionPlan: UserSubscriptionPlan
}

export function BillingForm({ subscriptionPlan }: BillingFormProps) {
  const statusLabel = {
    active: "Active",
    expired: "Expired",
    never_subscribed: "Not subscribed",
    inactive: "Needs review",
  }[subscriptionPlan.status]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership</CardTitle>
        <CardDescription>{subscriptionPlan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          Access status: <strong>{statusLabel}</strong>
        </p>
        {subscriptionPlan.subscriptionEndDate && (
          <p>
            Access ends: {subscriptionPlan.subscriptionEndDate.toLocaleDateString()}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          MoMo Payment Integration Pending
        </p>
      </CardContent>
    </Card>
  )
}
