import { Link, useNavigate } from "react-router";
import { useCart } from "@/hooks/useCart";
import Layout from "@/components/Layout";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
} from "lucide-react";
import { useState } from "react";

export default function Cart() {
  const { items, total, updateQuantity, removeFromCart } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const navigate = useNavigate();

  const shippingThreshold = 500;
  const shipping = total >= shippingThreshold ? 0 : 35;
  const tax = total * 0.15;
  const grandTotal = total + shipping + tax;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#171717] to-[#0F172A] pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mb-2">Shopping Cart</h1>
          <p className="text-[#94A3B8]">
            <Link to="/" className="hover:text-[#D4AF37]">Home</Link>
            {" > "}
            <span className="text-[#F8FAFC]">Cart</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 text-[#E2E8F0] mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[#171717] mb-2">Your Cart is Empty</h2>
            <p className="text-[#94A3B8] mb-8">Looks like you haven't added any products yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.map((item) => {
                const unitPrice = Number(item.product?.salePrice || item.product?.price || 0);
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 sm:p-6 bg-white rounded-2xl shadow-lg"
                  >
                    <Link to={`/product/${item.product?.slug}`} className="flex-shrink-0">
                      <img
                        src={item.product?.image || "/placeholder.png"}
                        alt={item.product?.name || ""}
                        className="w-24 h-24 object-contain rounded-xl bg-[#F8FAFC] p-2"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.product?.slug}`}>
                        <h3 className="font-semibold text-[#171717] hover:text-[#D4AF37] transition-colors line-clamp-1">
                          {item.product?.name}
                        </h3>
                      </Link>
                      <p className="text-[#D4AF37] font-bold mt-1">EGP {unitPrice}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                          <button
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(item.id, item.quantity - 1)
                                : removeFromCart(item.id)
                            }
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#E2E8F0] rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-[#E2E8F0] rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#94A3B8] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#171717]">EGP {itemTotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}

              {/* Free shipping progress */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#64748B]">
                    {total >= shippingThreshold
                      ? "You qualify for free shipping!"
                      : `Add EGP ${(shippingThreshold - total).toFixed(0)} more for free shipping`}
                  </span>
                  <span className="text-sm font-semibold text-[#171717]">
                    EGP {total.toFixed(0)} / {shippingThreshold}
                  </span>
                </div>
                <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8960F] rounded-full transition-all"
                    style={{ width: `${Math.min(100, (total / shippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-96 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-bold text-[#171717] mb-6">Order Summary</h3>

                {/* Discount Code */}
                <div className="flex gap-2 mb-6">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <button className="px-4 py-2.5 bg-[#171717] text-white text-sm font-semibold rounded-lg hover:bg-[#0F172A] transition-colors">
                    Apply
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Subtotal</span>
                    <span className="font-semibold text-[#171717]">EGP {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? "text-green-600" : "text-[#171717]"}`}>
                      {shipping === 0 ? "FREE" : `EGP ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">Tax (15%)</span>
                    <span className="font-semibold text-[#171717]">EGP {tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-[#171717]">Total</span>
                      <span className="text-2xl font-bold text-[#D4AF37]">EGP {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link
                  to="/shop"
                  className="block text-center mt-4 text-sm text-[#64748B] hover:text-[#171717] transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
