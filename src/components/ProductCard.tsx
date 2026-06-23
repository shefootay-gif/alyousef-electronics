import React, { useState } from "react";
import { Link } from "react-router";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

const ProductCard = React.memo(function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { t, lang } = useLanguage();
  const [liked, setLiked] = useState(false);

  const displayName = lang === "ar" && product.nameAr ? product.nameAr : product.name;

  const handleAddToCart = () => {
    addToCart(product.id, 1);
    toast.success(lang === "ar" ? `تمت إضافة ${displayName} للسلة!` : `${product.name} added to cart!`);
  };

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;

  // 3D Tilt Effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7.5deg", "-7.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7.5deg", "7.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative rounded-[2rem] bg-gradient-to-b from-[#0F172A] to-[#020617] shadow-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-500 group overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div 
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
        className="relative aspect-square bg-white/5 backdrop-blur-md overflow-hidden rounded-t-[2rem] border-b border-white/5 p-6"
      >
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image || "/placeholder.png"}
            alt={displayName}
            loading="lazy"
            className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700"
          />
        </Link>

        {salePrice && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
            {lang === "ar" ? "تخفيض" : "SALE"}
          </span>
        )}
        {product.isFeatured && !salePrice && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-[#C0C0C0] text-white text-xs font-bold rounded-lg">
            {lang === "ar" ? "جديد" : "NEW"}
          </span>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            aria-label={t("addToFavorites") || "Add to favorites"}
            onClick={() => setLiked(!liked)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${
              liked ? "bg-red-500/20 text-red-500 border-red-500/50" : "bg-black/40 text-[#94A3B8] border-white/10 hover:text-red-500 hover:border-white/30"
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-[#020617] to-transparent opacity-0 group-hover:opacity-100 transition-opacity translate-y-4 group-hover:translate-y-0 duration-500">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold text-sm rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {t("addToCart")}
          </button>
        </div>
      </div>

      <div className="p-6 relative z-10" style={{ transform: "translateZ(20px)" }}>
        <p className="text-[11px] font-bold tracking-widest text-[#D4AF37] mb-2 uppercase">
          {lang === "ar" && product.category?.nameAr ? product.category.nameAr : product.category?.name}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
            {displayName}
          </h3>
        </Link>

        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-3.5 h-3.5 ${
                star <= (product.averageRating || 0)
                  ? "text-[#D4AF37] fill-[#D4AF37]"
                  : "text-[#E2E8F0]"
              }`}
            />
          ))}
          <span className="text-xs text-[#94A3B8] ml-1">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">
            EGP {salePrice || price}
          </span>
          {salePrice && (
            <span className="text-sm font-semibold text-[#64748B] line-through decoration-red-500/50 decoration-2">
              EGP {price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});

export default ProductCard;
