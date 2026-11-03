import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

const money = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
  minimumFractionDigits: 2,
})

export default async function PaymentsPage() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  })

  return (
    <section className="min-h-screen p-6 md:p-10">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">HQ / Finance</p>
        <h1 className="mt-2 text-3xl font-black">Payment ledger</h1>
        <p className="mt-2 text-sm text-muted-foreground">Latest 100 payment attempts. Amounts are stored in pesewas.</p>
      </header>
      {payments.length === 0 ? (
        <div className="border border-dashed p-8 text-sm text-muted-foreground">No payment attempts have been recorded yet.</div>
      ) : (
        <div className="overflow-x-auto border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>{["Date", "Student", "Amount", "Status", "Reference"].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b last:border-0">
                  <td className="whitespace-nowrap px-4 py-3">{payment.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-3">{payment.user.name || "Unnamed"}<span className="block text-xs text-muted-foreground">{payment.user.email}</span></td>
                  <td className="px-4 py-3">{money.format(payment.amount / 100)}</td>
                  <td className="px-4 py-3"><span className="rounded border px-2 py-1 text-xs">{payment.status}</span></td>
                  <td className="max-w-64 truncate px-4 py-3 font-mono text-xs" title={payment.reference}>{payment.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
