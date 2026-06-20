import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import Layout from "@/components/Layout";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { t, lang, isRTL } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [liked, setLiked] = useState(false);

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  useEffect(() => {
    if (product) {
      document.title = `${lang === "ar" && product.nameAr ? product.nameAr : product.name} | AL-YOUSEF Electronics`;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      const desc = lang === "ar" && product.descriptionAr ? product.descriptionAr : (product.shortDescription || product.name);
      metaDescription.setAttribute('content', desc);
    }
  }, [product, lang]);

  const { data: relatedProducts } = trpc.product.list.useQuery(
    { categoryId: product?.categoryId, limit: 4, status: "active" },
    { enabled: !!product?.categoryId }
  );

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
    const displayName = lang === "ar" && product.nameAr ? product.nameAr : product.name;
    toast.success(lang === "ar" ? `تمت إضافة ${displayName} للسلة!` : `${product.name} added to cart!`);
  };

  const displayName = product ? (lang === "ar" && product.nameAr ? product.nameAr : product.name) : "";
  const displayDescription = product ? (lang === "ar" && product.descriptionAr ? product.descriptionAr : product.description) : "";

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-28">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-[#E2E8F0] rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-[#E2E8F0] rounded w-3/4" />
              <div className="h-6 bg-[#E2E8F0] rounded w-1/2" />
              <div className="h-4 bg-[#E2E8F0] rounded w-full" />
              <div className="h-4 bg-[#E2E8F0] rounded w-5/6" />
              <div className="h-12 bg-[#E2E8F0] rounded w-1/3 mt-6" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-28 text-center">
          <h1 className="text-2xl font-bold text-[#1A2A44] mb-4">{t("productNotFound")}</h1>
          <Link to="/shop" className="text-[#D4AF37] hover:underline">
            {t("backToShop")}
          </Link>
        </div>
      </Layout>
    );
  }

  const price = Number(product.price);
  const salePrice = product.salePrice ? Number(product.salePrice) : null;

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-[#F1F5F9] pt-24 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <Link to="/" className="hover:text-[#D4AF37]">{t("home")}</Link>
            <ChevronRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
            <Link to="/shop" className="hover:text-[#D4AF37]">{t("shop")}</Link>
            <ChevronRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
            <Link to={`/shop?category=${product.category?.slug}`} className="hover:text-[#D4AF37]">
              {lang === "ar" && product.category?.nameAr ? product.category.nameAr : product.category?.name}
            </Link>
            <ChevronRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
            <span className="text-[#1A2A44] font-medium">{displayName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] overflow-hidden flex items-center justify-center p-8">
              <img
                src={product.image || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <p className="text-sm text-[#94A3B8] mb-2">{product.brand}</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1A2A44] mb-3">
              {displayName}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (Number(product.averageRating) || 0)
                        ? "text-[#D4AF37] fill-[#D4AF37]"
                        : "text-[#E2E8F0]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#64748B]">
                ({product.averageRating || 0}) {product.reviewCount || 0} Reviews
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-[#D4AF37]">
                SAR {salePrice || price}
              </span>
              {salePrice && (
                <span className="text-xl text-[#94A3B8] line-through">SAR {price}</span>
              )}
              {salePrice && (
                <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg">
                  Save SAR {(price - salePrice).toFixed(0)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-3 h-3 rounded-full ${(product.stockQuantity || 0) > 0 ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-sm text-[#64748B]">
                {(product.stockQuantity || 0) > 0 ? `${t("inStock")} (${product.stockQuantity} ${t("units")})` : t("outOfStock")}
              </span>
            </div>

            {/* Short Description */}
            <p className="text-[#64748B] mb-6 leading-relaxed">{product.shortDescription}</p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-[#1A2A44]">{t("quantity")}</span>
              <div className="flex items-center gap-2 bg-white rounded-xl shadow border border-[#E2E8F0]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#F1F5F9] rounded-l-xl transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#F1F5F9] rounded-r-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#1A2A44] font-bold rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 transition-all ${
                  liked ? "border-red-500 bg-red-50 text-red-500" : "border-[#E2E8F0] hover:border-[#D4AF37]"
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Shipping info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#F8FAFC] rounded-xl">
                <Truck className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                <p className="text-xs text-[#64748B]">{t("freeDeliveryLabel")}</p>
                <p className="text-xs text-[#94A3B8]">SAR 500+</p>
              </div>
              <div className="text-center p-4 bg-[#F8FAFC] rounded-xl">
                <Shield className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                <p className="text-xs text-[#64748B]">{t("warrantyLabel")}</p>
                <p className="text-xs text-[#94A3B8]">{lang === "ar" ? "سنة واحدة" : "1 Year"}</p>
              </div>
              <div className="text-center p-4 bg-[#F8FAFC] rounded-xl">
                <RotateCcw className="w-6 h-6 text-[#D4AF37] mx-auto mb-2" />
                <p className="text-xs text-[#64748B]">{t("returnsLabel")}</p>
                <p className="text-xs text-[#94A3B8]">{lang === "ar" ? "30 يوم" : "30 Days"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <div className="flex gap-0 border-b border-[#E2E8F0]">
            {(["description", "specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-[1px] ${
                  activeTab === tab
                    ? "border-[#D4AF37] text-[#D4AF37]"
                    : "border-transparent text-[#64748B] hover:text-[#1A2A44]"
                }`}
              >
                {tab === "description" ? t("description") : tab === "specs" ? t("specifications") : t("reviews")}
              </button>
            ))}
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose max-w-none text-[#64748B] leading-relaxed">
                <p>{displayDescription || (lang === "ar" ? "لا يوجد وصف متاح." : "No description available.")}</p>
              </div>
            )}
            {activeTab === "specs" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#E2E8F0]">
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-semibold text-[#1A2A44] w-1/3">{t("brand")}</td>
                      <td className="py-3 px-4 text-[#64748B]">{product.brand}</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-semibold text-[#1A2A44]">{t("sku")}</td>
                      <td className="py-3 px-4 text-[#64748B]">{product.sku || (lang === "ar" ? "غير متوفر" : "N/A")}</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-semibold text-[#1A2A44]">{t("weight")}</td>
                      <td className="py-3 px-4 text-[#64748B]">{product.weight ? `${product.weight}g` : (lang === "ar" ? "غير متوفر" : "N/A")}</td>
                    </tr>
                    <tr className="hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 font-semibold text-[#1A2A44]">{t("stock")}</td>
                      <td className="py-3 px-4 text-[#64748B]">{product.stockQuantity} {t("units")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review: any) => (
                      <div key={review.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A2A44] to-[#00D4FF] flex items-center justify-center text-white font-bold text-sm">
                            {(review.userName || "A")[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-[#1A2A44] text-sm">{review.userName || "Anonymous"}</p>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= review.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#E2E8F0]"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-[#64748B] text-sm">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#64748B] text-center py-8">{t("noReviews")}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts?.items && relatedProducts.items.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-[#1A2A44] mb-8">
              {lang === "ar" ? (<>قد <span className="text-[#D4AF37]">يعجبك</span> أيضاً</>) : (<>You May Also <span className="text-[#D4AF37]">Like</span></>)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.items
                .filter((p: any) => p.id !== product.id)
                .slice(0, 4)
                .map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                  >
                    <div className="aspect-square bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] p-4">
                      <img
                        src={p.image || "/placeholder.png"}
                        alt={p.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#1A2A44] text-sm line-clamp-1">{p.name}</h3>
                      <p className="text-[#D4AF37] font-bold mt-1">SAR {p.salePrice || p.price}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
