import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/utils";

export default function CustomersManagement() {
  const { data: customers = [] } = trpc.customer.list.useQuery({ limit: 100 });

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">CRM</p>
        <h1 className="mt-2 text-3xl font-black">العملاء</h1>
      </div>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Orders</th>
              <th className="px-6 py-4">Total spent</th>
              <th className="px-6 py-4">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4">
                  <p className="font-bold">{customer.name || "Guest"}</p>
                  <p className="text-xs text-slate-400">{customer.email}</p>
                </td>
                <td className="px-6 py-4">{customer.phone || "-"}</td>
                <td className="px-6 py-4">{customer.ordersCount}</td>
                <td className="px-6 py-4 font-bold text-[#D4AF37]">{formatCurrency(customer.totalSpent, "en")}</td>
                <td className="px-6 py-4">{customer.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
