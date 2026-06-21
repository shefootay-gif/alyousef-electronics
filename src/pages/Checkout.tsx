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

const steps = [
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: Receipt },
];

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingData, setShippingData] = useState({
    firstName: user?.name ? user.name.split(" ")[0] : "",
    lastName: user?.name && user.name.split(" ").length > 1 ? user.name.split(" ").slice(1).join(" ") : "",
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
      toast.success("Order placed successfully!");
      navigate("/orders");
    },
    onError: (err) => {
      toast.error(err.message);
      setIsSubmitting(false);
    },
  });

  const shipping = total >= 500 ? 0 : 35;
  const tax = total * 0.15;
  const grandTotal = total + shipping + tax;

  const handlePlaceOrder = () => {
    const shippingSchema = z.object({
      firstName: z.string().min(2, lang === "ar" ? "الاسم الأول قصير جداً" : "First name is too short"),
      lastName: z.string().min(2, lang === "ar" ? "اسم العائلة قصير جداً" : "Last name is too short"),
      phone: z.string().regex(/^(05)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/, lang === "ar" ? "يجب أن يكون رقم الجوال سعودياً يبدأ بـ 05 ويتكون من 10 أرقام" : "Phone number must be a valid Saudi number starting with 05"),
      city: z.string().min(2, lang === "ar" ? "المدينة مطلوبة" : "City is required"),
      district: z.string().min(2, lang === "ar" ? "الحي مطلوب" : "District is required"),
      streetAddress: z.string().min(5, lang === "ar" ? "العنوان بالتفصيل مطلوب" : "Street address is required"),
    });

    const result = shippingSchema.safeParse(shippingData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    createOrder.mutate({
      shippingAddress: {
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        phone: shippingData.phone,
        streetAddress: shippingData.streetAddress,
        buildingNumber: shippingData.buildingNumber,
        district: shippingData.district,
        city: shippingData.city,
        postalCode: shippingData.postalCode || undefined,
        country: "Saudi Arabia",
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
          <h2 className="text-2xl font-bold text-[#171717] mb-4">Your cart is empty</h2>
          <Link to="/shop" className="text-[#D4AF37] hover:underline">
            Continue Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-28 pb-16">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/cart" className="text-[#64748B] hover:text-[#171717] transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-[#171717]">Checkout</h1>
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
                      : "bg-[#E2E8F0] text-[#94A3B8]"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span
                  className={`text-sm font-medium hidden sm:block ${
                    isActive ? "text-[#171717]" : isCompleted ? "text-green-600" : "text-[#94A3B8]"
                  }`}
                >
                  {step.label}
                </span>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? "bg-green-500" : "bg-[#E2E8F0]"}`} />
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
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[#171717] mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-[#171717] mb-1">First Name *</label>
                    <input
                      type="text"
                      value={shippingData.firstName}
                      onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none transition-colors"
                      placeholder="e.g. Ahmed"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-medium text-[#171717] mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={shippingData.lastName}
                      onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none transition-colors"
                      placeholder="e.g. Al-Rashid"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#171717] mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none transition-colors"
                      placeholder="05XXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#171717] mb-1">City *</label>
                    <select
                      value={shippingData.city}
                      onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none transition-colors"
                    >
                      <option value="">Select City</option>
                      <option value="Riyadh">Riyadh</option>
                      <option value="Jeddah">Jeddah</option>
                      <option value="Mecca">Mecca</option>
                      <option value="Medina">Medina</option>
                      <option value="Dammam">Dammam</option>
                      <option value="Khobar">Khobar</option>
                      <option value="Tabuk">Tabuk</option>
                      <option value="Abha">Abha</option>
                      <option value="Taif">Taif</option>
                      <option value="Buraidah">Buraidah</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#171717] mb-1">District *</label>
                    <input
                      type="text"
                      value={shippingData.district}
                      onChange={(e) => setShippingData({ ...shippingData, district: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none transition-colors"
                      placeholder="e.g. Al-Olaya District"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#171717] mb-1">Street Address *</label>
                    <textarea
                      value={shippingData.streetAddress}
                      onChange={(e) => setShippingData({ ...shippingData, streetAddress: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none transition-colors resize-none"
                      rows={2}
                      placeholder="Street name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#171717] mb-1">Building / Apartment</label>
                    <input
                      type="text"
                      value={shippingData.buildingNumber}
                      onChange={(e) => setShippingData({ ...shippingData, buildingNumber: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none transition-colors"
                      placeholder="e.g. Building 12, Apt 4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#171717] mb-1">Postal Code</label>
                    <input
                      type="text"
                      value={shippingData.postalCode}
                      onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none transition-colors"
                      placeholder="XXXXX"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!shippingData.firstName || !shippingData.lastName || !shippingData.phone || !shippingData.streetAddress || !shippingData.district || !shippingData.city) {
                      toast.error("Please fill in all required fields");
                      return;
                    }
                    setCurrentStep(1);
                  }}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {/* Payment Step */}
            {currentStep === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[#171717] mb-6">Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive your order" },
                    { id: "credit_card", label: "Credit / Debit Card", desc: "Visa, Mastercard, Mada" },
                    { id: "stc_pay", label: "STC Pay", desc: "Pay with STC Pay wallet" },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        paymentMethod === method.id
                          ? "border-[#D4AF37] bg-[#FEF9E7]"
                          : "border-[#E2E8F0] hover:border-[#94A3B8]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id ? "border-[#D4AF37]" : "border-[#E2E8F0]"
                          }`}
                        >
                          {paymentMethod === method.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-[#171717]">{method.label}</p>
                          <p className="text-sm text-[#94A3B8]">{method.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="px-6 py-4 border-2 border-[#E2E8F0] text-[#64748B] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Review Step */}
            {currentStep === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <h2 className="text-xl font-bold text-[#171717] mb-6">Review Your Order</h2>

                {/* Shipping Summary */}
                <div className="mb-6 p-4 bg-[#F8FAFC] rounded-xl">
                  <h3 className="font-semibold text-[#171717] mb-2">Shipping To</h3>
                  <p className="text-sm text-[#64748B]">{shippingData.firstName} {shippingData.lastName}</p>
                  <p className="text-sm text-[#64748B]">{shippingData.phone}</p>
                  <p className="text-sm text-[#64748B]">{shippingData.streetAddress}</p>
                  <p className="text-sm text-[#64748B]">{shippingData.district}, {shippingData.city}, Saudi Arabia</p>
                </div>

                {/* Payment Summary */}
                <div className="mb-6 p-4 bg-[#F8FAFC] rounded-xl">
                  <h3 className="font-semibold text-[#171717] mb-2">Payment Method</h3>
                  <p className="text-sm text-[#64748B]">
                    {paymentMethod === "cod" && "Cash on Delivery"}
                    {paymentMethod === "credit_card" && "Credit / Debit Card"}
                    {paymentMethod === "stc_pay" && "STC Pay"}
                  </p>
                </div>

                {/* Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-3 bg-[#F8FAFC] rounded-xl">
                      <img
                        src={item.product?.image || "/placeholder.png"}
                        alt={item.product?.name || ""}
                        className="w-16 h-16 object-contain rounded-lg bg-white"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-[#171717] text-sm">{item.product?.name}</p>
                        <p className="text-xs text-[#94A3B8]">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#D4AF37]">
                        SAR {(Number(item.product?.salePrice || item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-4 border-2 border-[#E2E8F0] text-[#64748B] font-semibold rounded-xl hover:bg-[#F8FAFC] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    Place Order - SAR {grandTotal.toFixed(2)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-[#171717] mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#64748B] line-clamp-1 flex-1 mr-2">
                      {item.product?.name} x{item.quantity}
                    </span>
                    <span className="text-[#171717] font-medium">
                      SAR {(Number(item.product?.salePrice || item.product?.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E2E8F0] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Subtotal</span>
                  <span className="font-semibold text-[#171717]">SAR {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-green-600" : "text-[#171717]"}`}>
                    {shipping === 0 ? "FREE" : `SAR ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#64748B]">Tax</span>
                  <span className="font-semibold text-[#171717]">SAR {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#E2E8F0] pt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#171717]">Total</span>
                    <span className="text-xl font-bold text-[#D4AF37]">SAR {grandTotal.toFixed(2)}</span>
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
