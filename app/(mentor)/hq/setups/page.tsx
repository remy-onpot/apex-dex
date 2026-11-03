import { CreateSetupForm } from "@/components/create-setup-form"

export default function ManageSetupsPage() {
  return (
    <main className="container max-w-3xl space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Publish Setup</h1>
        <p className="text-muted-foreground">
          Broadcast a new trade setup to the Inner Circle.
        </p>
      </header>
      <CreateSetupForm />
    </main>
  )
}