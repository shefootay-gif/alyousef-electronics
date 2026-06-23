import { useState } from "react";
import { Tag, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";

export default function CouponsManagement() {
  const utils = trpc.useUtils();
  const { data: coupons = [] } = trpc.promotion.list.useQuery();
  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "10",
    minSubtotal: "0",
    maxDiscount: "",
    usageLimit: "",
  });

  const createCoupon = trpc.promotion.create.useMutation({
    onSuccess: async () => {
      await utils.promotion.list.invalidate();
      setForm({ code: "", type: "percentage", value: "10", minSubtotal: "0", maxDiscount: "", usageLimit: "" });
      toast.success("تم إنشاء الكوبون");
    },
    onError: (error) => toast.error(error.message),
  });

  const deleteCoupon = trpc.promotion.delete.useMutation({
    onSuccess: async () => {
      await utils.promotion.list.invalidate();
      toast.success("تم حذف الكوبون");
    },
  });

  return (
    <div className="space-y-6 text-slate-100">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">Marketing</p>
        <h1 className="mt-2 text-3xl font-black">الكوبونات والخصومات</h1>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="grid gap-4 md:grid-cols-6">
          <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "percentage" | "fixed" })} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed EGP</option>
          </select>
          <input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Value" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <input value={form.minSubtotal} onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })} placeholder="Min subtotal" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <input value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Usage limit" className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#D4AF37]" />
          <button
            onClick={() => createCoupon.mutate({ ...form, maxDiscount: form.maxDiscount || null, usageLimit: form.usageLimit ? Number(form.usageLimit) : null, isActive: true })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-3 font-bold text-black"
          >
            <Plus className="h-4 w-4" />
            إضافة
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Used</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {coupons.map((coupon) => (
              <tr key={coupon.id}>
                <td className="px-6 py-4 font-bold text-[#D4AF37]"><Tag className="mr-2 inline h-4 w-4" />{coupon.code}</td>
                <td className="px-6 py-4">{coupon.type}</td>
                <td className="px-6 py-4">{coupon.value}</td>
                <td className="px-6 py-4">{coupon.usedCount || 0}/{coupon.usageLimit || "∞"}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => deleteCoupon.mutate({ id: coupon.id })} className="rounded-lg border border-red-500/20 p-2 text-red-300 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
