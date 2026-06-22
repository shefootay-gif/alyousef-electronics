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

  const shippingThreshold = 5000;
  const shipping = total >= shippingThreshold ? 0 : 35;
  const tax = total * 0.15;
  const grandTotal = total + shipping + tax;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-[#020617] relative pt-32 pb-16 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">Shopping Cart</h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] mx-auto rounded-full mb-6" />
          <p className="text-[#94A3B8] font-medium tracking-wide">
            <Link to="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
            <span className="mx-2 text-white/30">{">"}</span>
            <span className="text-[#D4AF37]">Cart</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 relative">
        {items.length === 0 ? (
          <div className="text-center py-24 bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl">
            <ShoppingBag className="w-24 h-24 text-white/10 mx-auto mb-8" />
            <h2 className="text-3xl font-black text-white mb-4">Your Cart is Empty</h2>
            <p className="text-[#94A3B8] text-lg mb-10">Looks like you haven't added any products yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-black font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] hover:scale-105 transition-all"
            >
              Start Shopping
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {items.map((item) => {
                const unitPrice = Number(item.product?.salePrice || item.product?.price || 0);
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row gap-6 p-6 sm:p-8 bg-black/20 border border-white/5 hover:bg-black/40 rounded-[2rem] shadow-xl transition-all group"
                  >
                    <Link to={`/product/${item.product?.slug}`} className="flex-shrink-0 mx-auto sm:mx-0">
                      <div className="w-32 h-32 rounded-2xl bg-white/5 flex items-center justify-center p-4">
                        <img
                          src={item.product?.image || "/placeholder.png"}
                          alt={item.product?.name || ""}
                          className="w-full h-full object-contain filter drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <Link to={`/product/${item.product?.slug}`}>
                        <h3 className="text-xl font-bold text-white hover:text-[#D4AF37] transition-colors line-clamp-2">
                          {item.product?.name}
                        </h3>
                      </Link>
                      <p className="text-[#D4AF37] font-bold mt-2">EGP {unitPrice}</p>
                      <div className="flex items-center gap-4 mt-6">
                        <div className="flex items-center gap-2 bg-[#0F172A] rounded-xl border border-white/10 p-1">
                          <button
                            onClick={() =>
                              item.quantity > 1
                                ? updateQuantity(item.id, item.quantity - 1)
                                : removeFromCart(item.id)
                            }
                            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-base font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#94A3B8] hover:text-red-500 transition-colors bg-white/5 w-12 h-12 flex items-center justify-center rounded-xl"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="sm:text-right flex-shrink-0 flex sm:flex-col justify-between items-center sm:items-end mt-4 sm:mt-0">
                      <span className="text-[#94A3B8] text-sm uppercase tracking-widest sm:hidden">Total:</span>
                      <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">EGP {itemTotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}

              {/* Free shipping progress */}
              <div className="bg-[#0F172A] border border-white/10 rounded-[2rem] shadow-xl p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-sm font-bold text-[#B6C2D2]">
                    {total >= shippingThreshold
                      ? "You qualify for free shipping! 🎉"
                      : `Add EGP ${(shippingThreshold - total).toFixed(0)} more for free shipping`}
                  </span>
                  <span className="text-sm font-black text-white">
                    EGP {total.toFixed(0)} <span className="text-white/30">/ {shippingThreshold}</span>
                  </span>
                </div>
                <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-white/5 relative z-10">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F8D778] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                    style={{ width: `${Math.min(100, (total / shippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="lg:w-[400px] flex-shrink-0">
              <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl p-8 sticky top-28">
                <h3 className="text-2xl font-black text-white mb-8">Order Summary</h3>

                {/* Discount Code */}
                <div className="flex gap-3 mb-8">
                  <div className="flex-1 relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                    <input
                      type="text"
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-black/40 rounded-xl border border-white/10 text-white text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                  <button className="px-6 py-4 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-colors">
                    Apply
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-base">
                    <span className="text-[#94A3B8]">Subtotal</span>
                    <span className="font-bold text-white">EGP {total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-[#94A3B8]">Shipping</span>
                    <span className={`font-bold ${shipping === 0 ? "text-green-500" : "text-white"}`}>
                      {shipping === 0 ? "FREE" : `EGP ${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base">
                    <span className="text-[#94A3B8]">Tax (15%)</span>
                    <span className="font-bold text-white">EGP {tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-6 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-xl">Total</span>
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">EGP {grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-6 h-6" />
                </button>
                <Link
                  to="/shop"
                  className="block text-center mt-6 text-sm font-bold text-[#94A3B8] hover:text-white transition-colors"
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
