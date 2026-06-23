import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { ArrowLeft, Check, CreditCard, Loader2, Receipt, Truck } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { formatCurrency } from "@/lib/utils";
import { trpc } from "@/providers/trpc";
import { egyptGovernorates, getGovernorateCenters } from "@contracts/egypt-locations";

type PaymentMethod = "cod" | "paymob" | "fawry";

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [selectedShippingRateId, setSelectedShippingRateId] = useState<number | null>(null);
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
  const governorateCenters = getGovernorateCenters(shippingData.city);

  const { data: shippingOptions } = trpc.shipping.options.useQuery(
    { city: shippingData.city, subtotal: total },
    { enabled: !!shippingData.city },
  );

  const couponValidation = trpc.promotion.validateCoupon.useQuery(
    { code: couponCode, subtotal: total },
    { enabled: false, retry: false },
  );

  useEffect(() => {
    if (!shippingOptions?.length) return;
    setSelectedShippingRateId((current) => current ?? shippingOptions[0].id);
  }, [shippingOptions]);

  const createOrder = trpc.order.create.useMutation({
    onSuccess: () => {
      clearCart();
      toast.success(lang === "ar" ? "تم إنشاء الطلب بنجاح" : "Order placed successfully");
      navigate("/orders");
    },
    onError: (err) => {
      toast.error(err.message);
      setIsSubmitting(false);
    },
  });

  const selectedShipping =
    shippingOptions?.find((option) => option.id === selectedShippingRateId) ?? shippingOptions?.[0];
  const shipping = selectedShipping?.amount ?? (total >= 5000 ? 0 : 35);
  const discount = appliedCoupon?.discountAmount ?? 0;
  const taxableSubtotal = Math.max(0, total - discount);
  const tax = Math.round(taxableSubtotal * 15) / 100;
  const grandTotal = Math.round((taxableSubtotal + shipping + tax) * 100) / 100;

  const steps = [
    { id: "shipping", label: t("shippingInfo"), icon: Truck },
    { id: "payment", label: t("paymentMethod"), icon: CreditCard },
    { id: "review", label: t("reviewOrder"), icon: Receipt },
  ];

  const validateShipping = () => {
    const shippingSchema = z.object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      email: z.string().email(),
      phone: z.string().regex(/^(01)(0|1|2|5)([0-9]{8})$/),
      city: z.string().min(2),
      district: z.string().min(2),
      streetAddress: z.string().min(5),
    });

    const result = shippingSchema.safeParse(shippingData);
    if (!result.success) {
      toast.error(lang === "ar" ? "راجع بيانات الشحن المطلوبة" : "Please check required shipping fields");
      return false;
    }

    return true;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const result = await couponValidation.refetch();
    if (!result.data) {
      setAppliedCoupon(null);
      toast.error(result.error?.message || "Invalid coupon");
      return;
    }

    setAppliedCoupon({ code: result.data.code, discountAmount: result.data.discountAmount });
    toast.success(lang === "ar" ? "تم تطبيق الكوبون" : "Coupon applied");
  };

  const placeOrder = () => {
    if (!validateShipping()) return;
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
      paymentMethod,
      couponCode: appliedCoupon?.code,
      shippingRateId: selectedShippingRateId || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.product?.salePrice || item.product?.price || "0",
      })),
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

        <div className="flex items-center gap-4 mb-10 max-w-2xl">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
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
                <span className={`text-sm font-medium hidden sm:block ${isActive ? "text-slate-100" : "text-[#94A3B8]"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            {currentStep === 0 && (
              <div className="bg-[#0F172A]/80 border border-white/10 rounded-[2rem] p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-100 mb-6">{t("shippingInfo")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ["firstName", t("firstName")],
                    ["lastName", t("lastName")],
                    ["email", t("emailAddress")],
                    ["phone", t("phone")],
                    ["streetAddress", t("streetAddress")],
                  ].map(([key, label]) => (
                    <label key={key} className={key === "streetAddress" ? "sm:col-span-2" : ""}>
                      <span className="block text-sm font-medium text-slate-300 mb-1">{label} *</span>
                      <input
                        value={shippingData[key as keyof typeof shippingData]}
                        onChange={(e) => setShippingData({ ...shippingData, [key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                        dir={key === "email" || key === "phone" ? "ltr" : "auto"}
                      />
                    </label>
                  ))}

                  <label>
                    <span className="block text-sm font-medium text-slate-300 mb-1">
                      {lang === "ar" ? "المحافظة" : "Governorate"} *
                    </span>
                    <select
                      value={shippingData.city}
                      onChange={(e) => {
                        setShippingData({ ...shippingData, city: e.target.value, district: "" });
                        setSelectedShippingRateId(null);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="">{lang === "ar" ? "اختر المحافظة" : "Select governorate"}</option>
                      {egyptGovernorates.map((governorate) => (
                        <option key={governorate.value} value={governorate.value}>
                          {lang === "ar" ? governorate.ar : governorate.en}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="block text-sm font-medium text-slate-300 mb-1">
                      {lang === "ar" ? "المركز / المدينة" : "Center / City"} *
                    </span>
                    <select
                      value={shippingData.district}
                      onChange={(e) => setShippingData({ ...shippingData, district: e.target.value })}
                      disabled={!shippingData.city}
                      className="w-full px-4 py-3 rounded-xl bg-[#0F172A] border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {shippingData.city
                          ? lang === "ar"
                            ? "اختر المركز أو المدينة"
                            : "Select center or city"
                          : lang === "ar"
                            ? "اختر المحافظة أولًا"
                            : "Select governorate first"}
                      </option>
                      {governorateCenters.map((center) => (
                        <option key={center.value} value={center.value}>
                          {lang === "ar" ? center.ar : center.en}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className="block text-sm font-medium text-slate-300 mb-1">{t("building")}</span>
                    <input
                      value={shippingData.buildingNumber}
                      onChange={(e) => setShippingData({ ...shippingData, buildingNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </label>
                </div>

                {shippingOptions && shippingOptions.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-300 mb-3">
                      {lang === "ar" ? "طريقة الشحن" : "Shipping method"}
                    </p>
                    <div className="grid gap-3">
                      {shippingOptions.map((option) => (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => setSelectedShippingRateId(option.id)}
                          className={`rounded-xl border p-4 text-left transition ${
                            selectedShippingRateId === option.id
                              ? "border-[#D4AF37] bg-[#D4AF37]/10"
                              : "border-white/10 bg-white/5 hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-semibold text-slate-100">{option.name}</p>
                              <p className="text-xs text-[#94A3B8]">
                                {option.estimatedDaysMin}-{option.estimatedDaysMax} days
                              </p>
                            </div>
                            <span className="font-bold text-[#D4AF37]" dir="ltr">
                              {option.amount === 0 ? t("free") : formatCurrency(option.amount, lang)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => validateShipping() && setCurrentStep(1)}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  {t("continueToPayment")}
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="bg-[#0F172A]/80 border border-white/10 rounded-[2rem] p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-100 mb-6">{t("paymentMethod")}</h2>
                <div className="space-y-3">
                  {[
                    { id: "cod", label: lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery", desc: "COD" },
                    { id: "paymob", label: lang === "ar" ? "Paymob بطاقة / محفظة" : "Paymob Card / Wallet", desc: "Visa, Mastercard, Wallets" },
                    { id: "fawry", label: "Fawry", desc: lang === "ar" ? "الدفع من خلال فوري" : "Pay through Fawry" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === method.id ? "border-[#D4AF37] bg-[#D4AF37]/10" : "border-white/10 bg-white/5"
                      }`}
                    >
                      <p className="font-semibold text-slate-100">{method.label}</p>
                      <p className="text-sm text-[#94A3B8]">{method.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setCurrentStep(0)} className="px-6 py-4 border border-white/10 text-[#94A3B8] font-semibold rounded-xl">
                    {t("previous")}
                  </button>
                  <button onClick={() => setCurrentStep(2)} className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl">
                    {t("reviewOrder")}
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-[#0F172A]/80 border border-white/10 rounded-[2rem] p-6 sm:p-8">
                <h2 className="text-xl font-bold text-slate-100 mb-6">{t("reviewOrder")}</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item) => {
                    const nameAr = (item.product as { nameAr?: string } | null | undefined)?.nameAr;
                    const lineTotal = Number(item.product?.salePrice || item.product?.price || 0) * item.quantity;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-xl">
                        <img src={item.product?.image || "/placeholder.png"} alt={item.product?.name || ""} className="w-16 h-16 object-contain rounded-lg bg-white/5" />
                        <div className="flex-1">
                          <p className="font-medium text-slate-100 text-sm">{lang === "ar" && nameAr ? nameAr : item.product?.name}</p>
                          <p className="text-xs text-[#94A3B8]">{t("quantity")} {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-[#D4AF37]" dir="ltr">{formatCurrency(lineTotal, lang)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(1)} className="px-6 py-4 border border-white/10 text-[#94A3B8] font-semibold rounded-xl">
                    {t("previous")}
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {t("placeOrder")} - {formatCurrency(grandTotal, lang)}
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:w-80 flex-shrink-0">
            <div className="bg-[#0F172A]/80 border border-white/10 rounded-[2rem] p-6 sticky top-24">
              <h3 className="font-bold text-slate-100 mb-4">{t("orderSummary")}</h3>
              <div className="space-y-2 mb-4">
                {items.map((item) => {
                  const nameAr = (item.product as { nameAr?: string } | null | undefined)?.nameAr;
                  const lineTotal = Number(item.product?.salePrice || item.product?.price || 0) * item.quantity;
                  return (
                    <div key={item.id} className="flex justify-between gap-3 text-sm">
                      <span className="text-[#94A3B8] line-clamp-1">
                        {lang === "ar" && nameAr ? nameAr : item.product?.name} x{item.quantity}
                      </span>
                      <span className="text-slate-100 font-medium" dir="ltr">{formatCurrency(lineTotal, lang)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mb-4 border-t border-white/10 pt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {lang === "ar" ? "كوبون الخصم" : "Discount coupon"}
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]"
                    placeholder="SAVE10"
                  />
                  <button type="button" onClick={applyCoupon} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15">
                    {lang === "ar" ? "تطبيق" : "Apply"}
                  </button>
                </div>
                {appliedCoupon && <p className="mt-2 text-xs text-green-400">-{formatCurrency(discount, lang)}</p>}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#94A3B8]">{t("subtotal")}</span>
                  <span className="font-semibold text-slate-100" dir="ltr">{formatCurrency(total, lang)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">{lang === "ar" ? "الخصم" : "Discount"}</span>
                    <span className="font-semibold text-green-400" dir="ltr">-{formatCurrency(discount, lang)}</span>
                  </div>
                )}
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
          </aside>
        </div>
      </div>
    </Layout>
  );
}
