import { useState } from "react";
import { Plus, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

export default function ShippingManagement() {
  const { lang } = useLanguage();
  const utils = trpc.useUtils();
  const { data: rates = [] } = trpc.shipping.list.useQuery();
  const [form, setForm] = useState({ name: "Standard shipping", city: "", price: "35", freeShippingThreshold: "5000", estimatedDaysMin: 1, estimatedDaysMax: 5 });
  const label = (en: string, ar: string) => (lang === "ar" ? ar : en);

  const createRate = trpc.shipping.create.useMutation({
    onSuccess: async () => {
      await utils.shipping.list.invalidate();
      toast.success(label("Shipping rate saved", "تم حفظ سعر الشحن"));
    },
  });

  const deleteRate = trpc.shipping.delete.useMutation({
    onSuccess: async () => {
      await utils.shipping.list.invalidate();
      toast.success(label("Shipping rate deleted", "تم حذف سعر الشحن"));
    },
  });

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">{label("Shipping", "الشحن")}</p>
        <h1 className="mt-2 text-3xl font-black">{label("Shipping management", "إدارة الشحن")}</h1>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="grid gap-4 md:grid-cols-6">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder={label("City or empty for default", "المدينة أو اتركها فارغة كافتراضي")} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder={label("Price", "السعر")} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <input value={form.freeShippingThreshold} onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })} placeholder={label("Free threshold", "حد الشحن المجاني")} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <input type="number" value={form.estimatedDaysMax} onChange={(e) => setForm({ ...form, estimatedDaysMax: Number(e.target.value) })} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <button onClick={() => createRate.mutate({ ...form, city: form.city || null, isActive: true })} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3 font-bold text-black">
            <Plus className="h-4 w-4" /> {label("Add", "إضافة")}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rates.map((rate) => (
          <div key={rate.id} className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Truck className="mb-3 h-6 w-6 text-[#D4AF37]" />
                <h3 className="font-bold">{rate.name}</h3>
                <p className="text-sm text-slate-400">{rate.city || label("Default all cities", "افتراضي لكل المدن")}</p>
              </div>
              <button onClick={() => deleteRate.mutate({ id: rate.id })} className="rounded-lg border border-red-500/20 p-2 text-red-300">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-2xl font-black text-[#D4AF37]">{formatCurrency(rate.price, lang)}</p>
            <p className="mt-1 text-xs text-slate-400">{label("Free from", "مجاني من")} {rate.freeShippingThreshold || label("not set", "غير محدد")} EGP</p>
          </div>
        ))}
      </section>
    </div>
  );
}
