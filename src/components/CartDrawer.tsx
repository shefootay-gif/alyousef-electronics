import { Link } from "react-router";
import { useCart } from "@/hooks/useCart";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";

export default function CartDrawer() {
  const { items, total, isOpen, setIsOpen, updateQuantity, removeFromCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#171717]">Shopping Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-[#E2E8F0] mb-4" />
              <p className="text-[#64748B] text-lg mb-2">Your cart is empty</p>
              <p className="text-[#94A3B8] text-sm mb-6">Add some products to get started</p>
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
              >
                <img
                  src={item.product?.image || "/placeholder.png"}
                  alt={item.product?.name || ""}
                  className="w-20 h-20 object-contain rounded-lg bg-white"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.product?.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-semibold text-[#171717] hover:text-[#D4AF37] transition-colors line-clamp-1"
                  >
                    {item.product?.name}
                  </Link>
                  <p className="text-[#D4AF37] font-bold text-sm mt-1">
                    EGP {item.product?.salePrice || item.product?.price}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        item.quantity > 1 &&
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center hover:border-[#D4AF37] transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center hover:border-[#D4AF37] transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B]">Subtotal</span>
              <span className="text-xl font-bold text-[#171717]">EGP {total.toFixed(2)}</span>
            </div>
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="block w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold text-center rounded-xl hover:shadow-lg transition-all"
            >
              View Cart
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="block w-full py-3 text-[#64748B] text-sm text-center hover:text-[#171717] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
