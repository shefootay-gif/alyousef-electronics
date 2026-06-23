import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/utils";

export default function FinanceManagement() {
  const { data: transactions = [] } = trpc.payment.transactions.useQuery();
  const { data: invoices = [] } = trpc.payment.invoices.useQuery();

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">Finance</p>
        <h1 className="mt-2 text-3xl font-black">المدفوعات والفواتير</h1>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80">
          <div className="border-b border-white/10 p-5 font-bold">Payment transactions</div>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-white/10">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-5 py-4">#{tx.orderId}</td>
                  <td className="px-5 py-4">{tx.provider}</td>
                  <td className="px-5 py-4">{tx.status}</td>
                  <td className="px-5 py-4 font-bold text-[#D4AF37]">{formatCurrency(tx.amount, "en")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80">
          <div className="border-b border-white/10 p-5 font-bold">Invoices</div>
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-white/10">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-5 py-4 font-mono text-[#D4AF37]">{invoice.invoiceNumber}</td>
                  <td className="px-5 py-4">Order #{invoice.orderId}</td>
                  <td className="px-5 py-4 font-bold">{formatCurrency(invoice.total, "en")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
