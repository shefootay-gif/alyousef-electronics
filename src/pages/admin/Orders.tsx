import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const orderStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  return_requested: "bg-orange-100 text-orange-700",
  returned: "bg-white/10 text-gray-700",
  refunded: "bg-white/10 text-gray-700",
};

export default function OrdersManagement() {
  const { t, lang, isRTL } = useLanguage();
  const label = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const { data: ordersData } = trpc.order.list.useQuery({ page: 1, limit: 50 });
  const utils = trpc.useUtils();

  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
      toast.success(label("Order status updated", "تم تحديث حالة الطلب"));
    },
  });

  return (
    <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="py-3 px-4 font-semibold text-slate-100">{t("orderNumber")}</th>
              <th className="py-3 px-4 font-semibold text-slate-100">{t("customer")}</th>
              <th className="py-3 px-4 font-semibold text-slate-100">{t("total")}</th>
              <th className="py-3 px-4 font-semibold text-slate-100">{t("status")}</th>
              <th className="py-3 px-4 font-semibold text-slate-100">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {ordersData?.items?.map((order: any) => (
              <tr key={order.id} className="hover:bg-white/5">
                <td className="py-3 px-4 font-medium">{order.orderNumber}</td>
                <td className="py-3 px-4">
                  <div className="font-medium text-slate-100">
                    {typeof order.shippingAddress === 'object' && order.shippingAddress !== null ? (
                      <>
                        {order.shippingAddress.firstName || order.shippingAddress.fullName} {order.shippingAddress.lastName || ''}
                      </>
                    ) : label("Guest", "ضيف")}
                  </div>
                  {typeof order.shippingAddress === 'object' && order.shippingAddress !== null && (
                    <div className="text-xs text-[#94A3B8] mt-1 space-y-0.5">
                      <p>{order.shippingAddress.phone}</p>
                      <p>{order.shippingAddress.district || ''}{order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}</p>
                      <p>{order.shippingAddress.streetAddress || order.shippingAddress.address || ''} {order.shippingAddress.buildingNumber ? `- ${order.shippingAddress.buildingNumber}` : ''}</p>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4 font-semibold text-[#D4AF37]">{formatCurrency(Number(order.total), lang)}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${orderStatusColors[order.status] || ""}`}>
                    {t(order.status)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value as any })}
                    className="text-xs rounded-lg border border-white/10 px-2 py-1 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="pending">{t("pending")}</option>
                    <option value="processing">{t("processing")}</option>
                    <option value="shipped">{t("shipped")}</option>
                    <option value="delivered">{t("delivered")}</option>
                    <option value="cancelled">{t("cancelled")}</option>
                    <option value="return_requested">{t("return_requested")}</option>
                    <option value="returned">{t("returned")}</option>
                    <option value="refunded">{t("refunded")}</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
