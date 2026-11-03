import { Metadata } from "next"

import { Icons } from "@/components/icons"
import { UserAuthForm } from "@/components/user-auth-form"

export const metadata: Metadata = {
  title: "Create an account",
  description: "Authenticate to access institutional setups and community reviews.",
}

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-3xl sm:h-96 sm:w-96"
      />
      <section className="relative w-full max-w-md rounded-2xl border border-border/50 bg-background/50 p-7 shadow-xl backdrop-blur-md sm:p-10">
        <div className="mb-8 flex flex-col items-center space-y-4 text-center">
          <Icons.logo className="h-7 w-7" />
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Enter the Inner Circle
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Authenticate to access institutional setups and community reviews.
            </p>
          </div>
        </div>
        <UserAuthForm className="mx-auto" />
      </section>
    </main>
  )
}
