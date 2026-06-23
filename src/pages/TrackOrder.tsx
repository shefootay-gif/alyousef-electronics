import { useState } from "react";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";
import { Search, MapPin, Package, Truck, CheckCircle2, AlertCircle } from "lucide-react";

const statuses = [
  { id: "pending", label: "Pending", labelAr: "قيد الانتظار", icon: AlertCircle },
  { id: "processing", label: "Processing", labelAr: "قيد المعالجة", icon: Package },
  { id: "shipped", label: "Shipped", labelAr: "تم الشحن", icon: Truck },
  { id: "delivered", label: "Delivered", labelAr: "تم التوصيل", icon: CheckCircle2 },
];

export default function TrackOrder() {
  const { lang, t } = useLanguage();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: order, isLoading, error, refetch } = trpc.order.trackOrder.useQuery(
    { orderNumber, phone },
    { enabled: false, retry: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !phone) return;
    setSearched(true);
    refetch();
  };

  const getStepStatus = (status: string, currentStatus: string) => {
    if (currentStatus === "cancelled" || currentStatus === "returned" || currentStatus === "refunded" || currentStatus === "return_requested") {
      return "inactive";
    }
    const currentIndex = statuses.findIndex(s => s.id === currentStatus);
    const stepIndex = statuses.findIndex(s => s.id === status);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-[#171717] to-[#0F172A] pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mb-4">
            {lang === "ar" ? "تتبع طلبك" : "Track Your Order"}
          </h1>
          <p className="text-[#94A3B8]">
            {lang === "ar" ? "أدخل رقم الطلب ورقم الجوال لمعرفة حالة شحنتك" : "Enter your order number and phone number to check your shipment status"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#171717] mb-1">
                {lang === "ar" ? "رقم الطلب" : "Order Number"}
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="AYE-XXXX-XXX"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#D4AF37] outline-none"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#171717] mb-1">
                {lang === "ar" ? "رقم الجوال" : "Phone Number"}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05XXXXXXXX"
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#D4AF37] outline-none"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Search className="w-5 h-5" />
                {lang === "ar" ? "تتبع" : "Track"}
              </button>
            </div>
          </form>
        </div>

        {searched && isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        )}

        {searched && !isLoading && error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="font-bold text-lg mb-2">
              {lang === "ar" ? "لم يتم العثور على الطلب" : "Order Not Found"}
            </h3>
            <p className="text-sm">
              {lang === "ar" ? "يرجى التأكد من صحة رقم الطلب ورقم الجوال والمحاولة مرة أخرى." : "Please verify your order number and phone number and try again."}
            </p>
          </div>
        )}

        {searched && !isLoading && order && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-[#171717] mb-1">
                    {lang === "ar" ? "تفاصيل الطلب" : "Order Details"}
                  </h2>
                  <p className="text-[#64748B]">#{order.orderNumber}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm text-[#64748B] mb-1">
                    {lang === "ar" ? "تاريخ الطلب" : "Order Date"}
                  </p>
                  <p className="font-semibold text-[#171717]">
                    {new Date(order.createdAt || Date.now()).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="relative mb-12 mt-8">
                <div className="absolute top-5 left-0 w-full h-1 bg-[#E2E8F0] -z-10 rounded-full" />
                  <div className="flex justify-between relative z-0">
                  {statuses.map((s) => {
                    const orderStatus = order.status ?? "pending";
                    const stepStatus = getStepStatus(s.id, orderStatus);
                    const Icon = s.icon;
                    return (
                      <div key={s.id} className="flex flex-col items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500 ${
                          stepStatus === "completed" ? "bg-green-500 text-white" :
                          stepStatus === "current" ? "bg-[#D4AF37] text-white ring-4 ring-[#D4AF37]/30" :
                          "bg-[#E2E8F0] text-[#94A3B8]"
                        }`}>
                          {stepStatus === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold text-center hidden sm:block ${
                          stepStatus === "completed" || stepStatus === "current" ? "text-[#171717]" : "text-[#94A3B8]"
                        }`}>
                          {lang === "ar" ? s.labelAr : s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Status Notice */}
              {["cancelled", "return_requested", "returned", "refunded"].includes(order.status ?? "") && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    {lang === "ar" ? "حالة الطلب الحالية: " : "Current Order Status: "}
                    {t(order.status ?? "pending")}
                  </span>
                </div>
              )}

              {/* Order Summary */}
              <div className="grid sm:grid-cols-2 gap-8 border-t border-[#E2E8F0] pt-8">
                <div>
                  <h3 className="font-bold text-[#171717] mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    {lang === "ar" ? "عنوان الشحن" : "Shipping Address"}
                  </h3>
                  <div className="bg-[#F8FAFC] p-4 rounded-xl space-y-1">
                    <p className="font-semibold text-[#171717]">
                      {(order.shippingAddress as any)?.firstName} {(order.shippingAddress as any)?.lastName}
                    </p>
                    <p className="text-sm text-[#64748B]">{(order.shippingAddress as any)?.phone}</p>
                    <p className="text-sm text-[#64748B] mt-2">{(order.shippingAddress as any)?.streetAddress}</p>
                    <p className="text-sm text-[#64748B]">{(order.shippingAddress as any)?.district}, {(order.shippingAddress as any)?.city}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-[#171717] mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#D4AF37]" />
                    {lang === "ar" ? "المنتجات" : "Items"}
                  </h3>
                  <div className="bg-[#F8FAFC] p-4 rounded-xl space-y-4">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.productImage || "/placeholder.png"} alt="" className="w-12 h-12 object-contain rounded bg-white" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#171717] line-clamp-1">{item.productName}</p>
                          <p className="text-xs text-[#94A3B8]">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
