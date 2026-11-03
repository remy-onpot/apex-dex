import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"

export default async function ContinuePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  redirect(user.role === "MENTOR" ? "/hq" : "/desk/feed")
}
