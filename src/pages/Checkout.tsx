import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "@/hooks/useCart";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import {
  Check,
  CreditCard,
  Truck,
  Receipt,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { z } from "zod";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { id: "shipping", label: t("shippingInfo"), icon: Truck },
    { id: "payment", label: t("paymentMethod"), icon: CreditCard },
    { id: "review", label: t("reviewOrder"), icon: Receipt },
  ];

  const [shippingData, setShippingData] = useState({
    firstName: user?.name ? user.name.split(" ")[0] : "",
    lastName: user?.name && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : "",
    email: user?.email || "",
    phone: user?.phone || "",
    district: "",
    streetAddress: "",
    buildingNumber: "",
    city: "",
    postalCode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "credit_card" | "stc_pay">("cod");

  const createOrder = trpc.order.create.useMutation({
    onSuccess: () => {
      clearCart();
      toast.success(lang === "ar" ? "تم تأكيد الطلب بنجاح!" : "Order placed successfully!");
      navigate("/orders");
    },
    onError: (err) => {
      toast.error(err.message);
      setIsSubmitting(false);
    },
  });

  const shipping = total >= 5000 ? 0 : 35;
  const tax = Math.round(total * 15) / 100;
  const grandTotal = Math.round((total + shipping + tax) * 100) / 100;

  const handlePlaceOrder = () => {
    const shippingSchema = z.object({
      firstName: z.string().min(2, lang === "ar" ? "الاسم الأول قصير جداً" : "First name is too short"),
      lastName: z.string().min(2, lang === "ar" ? "اسم العائلة قصير جداً" : "Last name is too short"),
      email: z.string().email(lang === "ar" ? "البريد الإلكتروني غير صالح" : "Invalid email address"),
      phone: z.string().regex(/^(01)(0|1|2|5)([0-9]{8})$/, lang === "ar" ? "يجب أن يكون رقم الهاتف مصري صالح يبدأ بـ 01 ويتكون من 11 رقماً" : "Phone number must be a valid Egyptian number starting with 01"),
      city: z.string().min(2, lang === "ar" ? "المدينة مطلوبة" : "City is required"),
      district: z.string().min(2, lang === "ar" ? "الحي مطلوب" : "District is required"),
      streetAddress: z.string().min(5, lang === "ar" ? "العنوان بالتفصيل مطلوب" : "Street address is required"),
    });

    const result = shippingSchema.safeParse(shippingData);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);
    createOrder.mutate({
      shippingAddress: {
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        email: shippingData.email,
        phone: shippingData.phone,
        streetAddress: shippingData.streetAddress,
        buildingNumber: shippingData.buildingNumber,
        district: shippingData.district,
        city: shippingData.city,
        postalCode: shippingData.postalCode || undefined,
        country: "Egypt",
      },
      paymentMethod: paymentMethod as any,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product?.salePrice || item.product?.price || "0",
      })),
      subtotal: total.toString(),
      shippingAmount: shipping.toString(),
      taxAmount: tax.toString(),
      total: grandTotal.toString(),
    });
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-28 text-center">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">{t("emptyCart")}</h2>
          <Link to="/shop" className="text-[#D4AF37] hover:underline">
            {t("continueShopping")}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-28 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="text-[#94A3B8] hover:text-white transition-colors">
            <ArrowLeft className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
          </Link>
          <h1 className="text-3xl font-bold text-slate-100">{t("proceedToCheckout")}</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mb-10 max-w-2xl">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === currentStep;
            const isCompleted = i < currentStep;

            return (
              <div key={step.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isActive
                      ? "bg-[#D4AF37] text-[#171717]"
                      : "bg-[#0F172A] border border-white/10 text-[#94A3B8]"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    isActive ? "text-slate-100" : isCompleted ? "text-green-500" : "text-[#94A3B8]"
                  }`}
                >
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-white/10"}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Shipping Step */}
            {currentStep === 0 && (
              <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-100 mb-6">{t("shippingInfo")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t("firstName")} *</label>
                    <input
                      type="text"
                      value={shippingData.firstName}
                      onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="e.g. Ahmed"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">{t("lastName")} *</label>
                      <input
                        type="text"
                        value={shippingData.lastName}
                        onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                        dir="auto"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t("emailAddress")} *</label>
                    <input
                      type="email"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t("phone")} *</label>
                    <input
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="01XXXXXXXXX"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t("city")} *</label>
                    <select
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                    >
                      <option value="">{t("selectCity")}</option>
                      <option value="Cairo">Cairo</option>
                      <option value="Alexandria">Alexandria</option>
                      <option value="Giza">Giza</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t("district")} *</label>
                    <input
                      type="text"
                      value={shippingData.district}
                      onChange={(e) => setShippingData({ ...shippingData, district: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      placeholder="e.g. Nasr City"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t("streetAddress")} *</label>
                    <textarea
                      value={shippingData.streetAddress}
                      onChange={(e) => setShippingData({ ...shippingData, streetAddress: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t("building")}</label>
                    <input
                      type="text"
                      value={shippingData.buildingNumber}
                      onChange={(e) => setShippingData({ ...shippingData, buildingNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t("postalCode")}</label>
                    <input
                      type="text"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                      dir="ltr"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!shippingData.firstName || !shippingData.lastName || !shippingData.phone || !shippingData.streetAddress || !shippingData.district || !shippingData.city) {
                      toast.error(t("fillRequired"));
                      return;
                    }
                    setCurrentStep(1);
                  }}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  {t("continueToPayment")}
                </button>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 1 && (
              <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-100 mb-6">{t("paymentMethod")}</h2>
                <div className="space-y-3">
                  {[
                    { id: "cod", label: lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery", desc: lang === "ar" ? "الدفع نقداً عند استلام الطلب" : "Pay when you receive your order" },
                    { id: "credit_card", label: lang === "ar" ? "بطاقة ائتمانية / مدى" : "Credit / Debit Card", desc: "Visa, Mastercard, Mada" },
                    { id: "stc_pay", label: "STC Pay / Apple Pay", desc: lang === "ar" ? "الدفع عبر المحافظ الإلكترونية" : "Pay with Digital Wallets" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`w-full p-4 rounded-xl border border-white/10 text-left transition-all ${
                        paymentMethod === method.id
                          ? "border-[#D4AF37] bg-[#D4AF37]/10"
                          : "bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id ? "border-[#D4AF37]" : "border-white/20"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-100">{method.label}</p>
                          <p className="text-sm text-[#94A3B8]">{method.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="px-6 py-4 border border-white/10 text-[#94A3B8] font-semibold rounded-xl hover:bg-white/5 transition-all"
                  >
                    {t("previous")}
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    {t("reviewOrder")}
                  </button>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 2 && (
              <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-100 mb-6">{t("reviewOrder")}</h2>

                {/* Shipping Summary */}
                <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="font-semibold text-slate-200 mb-2">{t("shippingTo")}</h3>
                  <p className="text-sm text-[#94A3B8]">{shippingData.firstName} {shippingData.lastName}</p>
                  <p className="text-sm text-[#94A3B8]">{shippingData.phone}</p>
                  <p className="text-sm text-[#94A3B8]">{shippingData.streetAddress}</p>
                  <p className="text-sm text-[#94A3B8]">{shippingData.district}, {shippingData.city}, Egypt</p>
                </div>

                {/* Payment Summary */}
                <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="font-semibold text-slate-200 mb-2">{t("paymentMethod")}</h3>
                  <p className="text-sm text-[#94A3B8]">
                    {paymentMethod === "cod" && (lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery")}
                    {paymentMethod === "credit_card" && (lang === "ar" ? "بطاقة ائتمانية / مدى" : "Credit / Debit Card")}
                    {paymentMethod === "stc_pay" && "STC Pay / Apple Pay"}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl">
                      <img
                        src={item.product?.image || "/placeholder.png"}
                        alt={item.product?.name || ""}
                        className="w-16 h-16 object-cover rounded-lg bg-white/5"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-100 text-sm">{lang === "ar" && (item.product as any)?.nameAr ? item.product.nameAr : item.product?.name}</p>
                        <p className="text-xs text-[#94A3B8]">{t("quantity")} {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#D4AF37]" dir="ltr">
                        {formatCurrency((Number(item.product?.salePrice || item.product?.price || 0) * item.quantity), lang)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-4 border border-white/10 text-[#94A3B8] font-semibold rounded-xl hover:bg-white/5 transition-all"
                  >
                    {t("previous")}
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {t("placeOrder")} - {formatCurrency(grandTotal, lang)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-[#0F172A]/80 border border-white/10 backdrop-blur-xl rounded-[2rem] p-6 sticky top-24">
              <h3 className="font-bold text-slate-100 mb-4">{t("orderSummary")}</h3>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#94A3B8] line-clamp-1 flex-1 mr-2">
                      {lang === "ar" && (item.product as any)?.nameAr ? item.product.nameAr : item.product?.name} x{item.quantity}
                    </span>
                    <span className="text-slate-100 font-medium" dir="ltr">
                      {formatCurrency((Number(item.product?.salePrice || item.product?.price || 0) * item.quantity), lang)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">{t("subtotal")}</span>
                  <span className="font-semibold text-slate-100" dir="ltr">{formatCurrency(total, lang)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">{t("shipping")}</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-green-500" : "text-slate-100"}`} dir="ltr">
                    {shipping === 0 ? t("free") : formatCurrency(shipping, lang)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">Tax (15%)</span>
                  <span className="font-semibold text-slate-100" dir="ltr">{formatCurrency(tax, lang)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-100">{t("total")}</span>
                    <span className="text-xl font-bold text-[#D4AF37]" dir="ltr">{formatCurrency(grandTotal, lang)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
