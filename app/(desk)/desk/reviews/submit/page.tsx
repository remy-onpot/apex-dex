import { SubmitChartForm } from "@/components/submit-chart-form"

export default function SubmitChartPage() {
  return (
    <main className="container max-w-3xl space-y-8 py-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Submit Chart</h1>
        <p className="text-muted-foreground">
          Paste your TradingView image link and explain your setup.
        </p>
      </header>
      <SubmitChartForm />
    </main>
  )
}