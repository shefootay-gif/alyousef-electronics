import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Package, ChevronLeft, ChevronRight, Clock, MapPin, CreditCard, RefreshCcw } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang, isRTL } = useLanguage();
  const utils = trpc.useUtils();
  
  const { data: order, isLoading } = trpc.order.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const requestReturn = trpc.order.requestReturn.useMutation({
    onSuccess: () => {
      utils.order.getById.invalidate({ id: Number(id) });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-32 pb-12 text-center">Loading...</div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="pt-32 pb-12 text-center">Order not found</div>
      </Layout>
    );
  }

  const shipping = order.shippingAddress as any;

  return (
    <Layout>
      <div className="bg-gradient-to-r from-[#171717] to-[#0F172A] pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-[#94A3B8] hover:text-[#F8FAFC] mb-4 transition-colors"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {lang === "ar" ? "العودة للطلبات" : "Back to Orders"}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mb-2">Order #{order.orderNumber}</h1>
              <p className="text-[#94A3B8]">
                {new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusColors[order.status] || "bg-gray-100"}`}>
              {t(order.status) || order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#171717] mb-4 border-b pb-4">{lang === "ar" ? "المنتجات" : "Items"}</h2>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <img
                      src={item.productImage || "/placeholder.png"}
                      alt={item.productName}
                      className="w-20 h-20 object-contain rounded-lg bg-white"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-[#171717]">{item.productName}</p>
                      <p className="text-sm text-[#64748B] mb-2">{lang === "ar" ? "الكمية:" : "Qty:"} {item.quantity}</p>
                      <p className="font-bold text-[#D4AF37]">SAR {Number(item.totalPrice).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#171717] mb-4 border-b pb-4">{lang === "ar" ? "ملخص الدفع" : "Payment Summary"}</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-[#64748B]">
                  <span>{lang === "ar" ? "المجموع الفرعي" : "Subtotal"}</span>
                  <span>SAR {Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>{lang === "ar" ? "الشحن" : "Shipping"}</span>
                  <span>SAR {Number(order.shippingAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#64748B]">
                  <span>{lang === "ar" ? "الضريبة" : "Tax"}</span>
                  <span>SAR {Number(order.taxAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-[#171717] pt-3 border-t">
                  <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
                  <span className="text-[#D4AF37]">SAR {Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#171717] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                {lang === "ar" ? "عنوان الشحن" : "Shipping Address"}
              </h2>
              {shipping ? (
                <div className="text-sm text-[#64748B] space-y-1">
                  <p className="font-semibold text-[#171717]">{shipping.firstName} {shipping.lastName}</p>
                  <p>{shipping.phone}</p>
                  <p>{shipping.streetAddress}</p>
                  {shipping.buildingNumber && <p>{shipping.buildingNumber}</p>}
                  <p>{shipping.district}</p>
                  <p>{shipping.city}, {shipping.country}</p>
                </div>
              ) : (
                <p className="text-sm text-[#64748B]">{lang === "ar" ? "لا يوجد عنوان" : "No address provided"}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#171717] mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#D4AF37]" />
                {lang === "ar" ? "الدفع" : "Payment"}
              </h2>
              <p className="text-sm text-[#64748B] capitalize">{t(order.paymentMethod) || order.paymentMethod?.replace("_", " ")}</p>
              <p className={`text-xs font-semibold mt-2 inline-block px-2 py-1 rounded ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {t(order.paymentStatus) || order.paymentStatus}
              </p>
            </div>
            
            {order.status === "delivered" && (
              <button
                onClick={() => {
                  if (window.confirm(lang === "ar" ? "هل أنت متأكد من طلب استرجاع هذا الطلب؟" : "Are you sure you want to request a return for this order?")) {
                    requestReturn.mutate({ id: order.id });
                  }
                }}
                disabled={requestReturn.isPending}
                className="w-full py-3 px-4 bg-red-50 text-red-600 font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <RefreshCcw className="w-5 h-5" />
                {t("requestReturn")}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
