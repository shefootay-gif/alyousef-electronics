import { useState } from "react";
import { Link } from "react-router";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function ProductCard({ product }: { product: any }) {
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
      className="rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
    >
      <div 
        style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
        className="relative aspect-square bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] overflow-hidden rounded-t-2xl"
      >
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image || "/placeholder.png"}
            alt={displayName}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
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
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              liked ? "bg-red-500 text-white" : "bg-white text-[#64748B] hover:text-red-500"
            } shadow-md`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#171717]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold text-sm rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {t("addToCart")}
          </button>
        </div>
      </div>

      <div className="p-5" style={{ transform: "translateZ(20px)" }}>
        <p className="text-xs text-[#94A3B8] mb-1">
          {lang === "ar" && product.category?.nameAr ? product.category.nameAr : product.category?.name}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-base font-semibold text-[#171717] line-clamp-1 hover:text-[#D4AF37] transition-colors">
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

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xl font-bold text-[#D4AF37]">
            EGP {salePrice || price}
          </span>
          {salePrice && (
            <span className="text-sm text-[#94A3B8] line-through">
              EGP {price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
