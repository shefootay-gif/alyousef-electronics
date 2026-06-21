import { useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function PromoBar() {
  const [isVisible, setIsVisible] = useState(true);
  const { lang } = useLanguage();

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-[#D4AF37] via-[#F8D778] to-[#B8960F] text-[#1A2A44] px-4 py-2 text-sm font-bold flex justify-center items-center relative z-50 shadow-md">
      <p className="text-center w-full pr-6 animate-pulse">
        {lang === "ar" 
          ? "🎉 عرض خاص: شحن مجاني لجميع الطلبات فوق 500 ريال!" 
          : "🎉 Special Offer: Free shipping on all orders over SAR 500!"}
      </p>
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
