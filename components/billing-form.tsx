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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Membership</CardTitle>
        <CardDescription>{subscriptionPlan.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          Premium status: <strong>{subscriptionPlan.isPremium ? "Premium" : "Free"}</strong>
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
