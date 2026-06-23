import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

export default function CustomersManagement() {
  const { lang, isRTL } = useLanguage();
  const { data: customers = [] } = trpc.customer.list.useQuery({ limit: 100 });
  const label = (en: string, ar: string) => (lang === "ar" ? ar : en);

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">{label("CRM", "إدارة العملاء")}</p>
        <h1 className="mt-2 text-3xl font-black">{label("Customers", "العملاء")}</h1>
      </div>
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80">
        <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-6 py-4">{label("Customer", "العميل")}</th>
              <th className="px-6 py-4">{label("Phone", "الهاتف")}</th>
              <th className="px-6 py-4">{label("Orders", "الطلبات")}</th>
              <th className="px-6 py-4">{label("Total spent", "إجمالي الإنفاق")}</th>
              <th className="px-6 py-4">{label("Role", "الدور")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4">
                  <p className="font-bold">{customer.name || label("Guest", "زائر")}</p>
                  <p className="text-xs text-slate-400">{customer.email}</p>
                </td>
                <td className="px-6 py-4">{customer.phone || "-"}</td>
                <td className="px-6 py-4">{customer.ordersCount}</td>
                <td className="px-6 py-4 font-bold text-[#D4AF37]">{formatCurrency(customer.totalSpent, lang)}</td>
                <td className="px-6 py-4">{customer.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
