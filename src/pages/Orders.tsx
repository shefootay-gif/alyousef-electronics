import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Package, ChevronRight, Clock, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function Orders() {
  const { t, lang, isRTL } = useLanguage();
  const utils = trpc.useUtils();
  const { data: ordersData, isLoading } = trpc.order.list.useQuery({ page: 1, limit: 20 });
  const requestReturn = trpc.order.requestReturn.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate();
    },
  });

  return (
    <Layout>
      <div className="bg-gradient-to-r from-[#1A2A44] to-[#0F172A] pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mb-2">{t("myOrders")}</h1>
          <p className="text-[#94A3B8]">
            <Link to="/" className="hover:text-[#D4AF37]">{t("home")}</Link>
            {isRTL ? " < " : " > "}
            <span className="text-[#F8FAFC]">{t("myOrders")}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-4 bg-[#E2E8F0] rounded w-1/4 mb-2" />
                <div className="h-4 bg-[#E2E8F0] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : ordersData?.items && ordersData.items.length > 0 ? (
          <div className="space-y-4">
            {ordersData.items.map((order: any) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                        <Package className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#1A2A44]">{order.orderNumber}</p>
                        <p className="text-xs text-[#94A3B8]">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || "bg-gray-100"}`}>
                      {t(order.status) || order.status}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="flex gap-4 overflow-x-auto pb-3">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex-shrink-0 flex items-center gap-3 p-2 bg-[#F8FAFC] rounded-xl">
                        <img
                          src={item.productImage || "/placeholder.png"}
                          alt={item.productName}
                          className="w-12 h-12 object-contain rounded-lg bg-white"
                        />
                        <div>
                          <p className="text-sm font-medium text-[#1A2A44] line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-[#94A3B8]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-2 text-sm text-[#64748B]">
                      <Clock className="w-4 h-4" />
                      <span>Total: <span className="font-bold text-[#D4AF37]">SAR {Number(order.total).toFixed(2)}</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                      {order.status === "delivered" && (
                        <button
                          onClick={() => {
                            if (window.confirm(lang === "ar" ? "هل أنت متأكد من طلب استرجاع هذا الطلب؟" : "Are you sure you want to request a return for this order?")) {
                              requestReturn.mutate({ id: order.id });
                            }
                          }}
                          disabled={requestReturn.isPending}
                          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                        >
                          <RefreshCcw className="w-4 h-4" />
                          {t("requestReturn")}
                        </button>
                      )}
                      <Link
                        to={`/order/${order.id}`}
                        className="flex items-center gap-1 text-sm text-[#D4AF37] hover:text-[#B8960F] font-medium transition-colors"
                      >
                        {lang === "ar" ? "التفاصيل" : "View Details"}
                        <ChevronRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#1A2A44] mb-2">No Orders Yet</h2>
            <p className="text-[#94A3B8] mb-6">You haven't placed any orders yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#1A2A44] font-bold rounded-xl"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
