import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
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
  Send,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { t, lang, isRTL } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [liked, setLiked] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const { data: reviews, refetch: refetchReviews } = trpc.review.listByProduct.useQuery(
    { productId: product?.id as number },
    { enabled: !!product?.id }
  );

  const addReview = trpc.review.add.useMutation({
    onSuccess: () => {
      toast.success(lang === "ar" ? "تمت إضافة تقييمك بنجاح!" : "Review added successfully!");
      setReviewForm({ rating: 5, title: "", comment: "" });
      refetchReviews();
      setSubmittingReview(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setSubmittingReview(false);
    }
  });

  useEffect(() => {
    if (product) {
      const title = `${lang === "ar" && product.nameAr ? product.nameAr : product.name} | AL-YOUSEF Electronics`;
      document.title = title;
      
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      const desc = lang === "ar" && product.descriptionAr ? product.descriptionAr : (product.shortDescription || product.name);
      metaDesc.setAttribute('content', desc);

      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      if (product.image) {
        ogImage.setAttribute('content', product.image);
      }
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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    setSubmittingReview(true);
    addReview.mutate({
      productId: product.id,
      ...reviewForm
    });
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
          <h1 className="text-2xl font-bold text-[#171717] mb-4">{t("productNotFound")}</h1>
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
      <div className="bg-[#020617] relative pt-28 pb-6 border-b border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link to="/" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors">{t("home")}</Link>
            <ChevronRight className={`w-4 h-4 text-white/30 ${isRTL ? "rotate-180" : ""}`} />
            <Link to="/shop" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors">{t("shop")}</Link>
            <ChevronRight className={`w-4 h-4 text-white/30 ${isRTL ? "rotate-180" : ""}`} />
            <Link to={`/shop?category=${product.category?.slug}`} className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors">
              {lang === "ar" && product.category?.nameAr ? product.category.nameAr : product.category?.name}
            </Link>
            <ChevronRight className={`w-4 h-4 text-white/30 ${isRTL ? "rotate-180" : ""}`} />
            <span className="text-white font-bold">{displayName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="relative aspect-square rounded-[3rem] bg-white/5 backdrop-blur-3xl border border-white/10 overflow-hidden flex items-center justify-center p-12 shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src={product.image || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-105 group-hover:-translate-y-2 transition-transform duration-700"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold tracking-widest text-[#B6C2D2] mb-2 uppercase">
              {product.brand}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
              {displayName}
            </h1>

            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (Number(product.averageRating) || 0)
                        ? "text-[#D4AF37] fill-[#D4AF37] filter drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                        : "text-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#94A3B8]">
                ({product.averageRating || 0}) <span className="mx-1">•</span> {reviews?.length || 0} {lang === "ar" ? "تقييمات" : "Reviews"}
              </span>
            </div>

            <div className="flex items-center gap-4 py-4 border-y border-white/10">
              <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">
                EGP {salePrice || price}
              </span>
              {salePrice && (
                <span className="text-xl font-bold text-[#64748B] line-through decoration-red-500/50 decoration-2">EGP {price}</span>
              )}
              {salePrice && (
                <span className="ml-auto px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 text-sm font-bold rounded-xl animate-pulse">
                  {lang === "ar" ? "وفّر" : "Save"} EGP {(price - salePrice).toFixed(0)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${(product.stockQuantity || 0) > 0 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" : "bg-red-500"}`} />
              <span className="text-sm font-bold text-[#94A3B8]">
                {(product.stockQuantity || 0) > 0 ? `${t("inStock")} (${product.stockQuantity} ${t("units")})` : t("outOfStock")}
              </span>
            </div>

            <p className="text-[#94A3B8] text-lg leading-relaxed">{product.shortDescription}</p>

            <div className="flex items-center gap-6 pt-4">
              <span className="text-sm font-bold text-white uppercase tracking-widest">{t("quantity")}</span>
              <div className="flex items-center gap-2 bg-[#0F172A] rounded-2xl border border-white/10 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center font-bold text-white text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stockQuantity === 0}
                className="flex-1 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#050505] font-black text-lg rounded-2xl shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.02]"
              >
                <ShoppingCart className="w-6 h-6" />
                {t("addToCart")}
              </button>
              <button
                onClick={() => setLiked(!liked)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all backdrop-blur-md ${
                  liked ? "bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "bg-white/5 border-white/10 text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                }`}
              >
                <Heart className={`w-7 h-7 ${liked ? "fill-current" : ""}`} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center p-6 bg-[#0F172A] border border-white/10 rounded-2xl">
                <Truck className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                <p className="text-sm font-bold text-white mb-1">{t("freeDeliveryLabel")}</p>
                <p className="text-xs text-[#94A3B8]">EGP 5000+</p>
              </div>
              <div className="text-center p-6 bg-[#0F172A] border border-white/10 rounded-2xl">
                <Shield className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                <p className="text-sm font-bold text-white mb-1">{t("warrantyLabel")}</p>
                <p className="text-xs text-[#94A3B8]">{lang === "ar" ? "سنة واحدة" : "1 Year"}</p>
              </div>
              <div className="text-center p-6 bg-[#0F172A] border border-white/10 rounded-2xl">
                <RotateCcw className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                <p className="text-sm font-bold text-white mb-1">{t("returnsLabel")}</p>
                <p className="text-xs text-[#94A3B8]">{lang === "ar" ? "30 يوم" : "30 Days"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24">
          <div className="flex gap-4 border-b border-white/10 pb-1">
            {(["description", "specs", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-base font-bold capitalize transition-all border-b-2 -mb-[2px] ${
                  activeTab === tab
                    ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 rounded-t-xl"
                    : "border-transparent text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-t-xl"
                }`}
              >
                {tab === "description" ? t("description") : tab === "specs" ? t("specifications") : t("reviews")}
              </button>
            ))}
          </div>

          <div className="py-12">
            {activeTab === "description" && (
              <div className="prose max-w-none text-[#B6C2D2] text-lg leading-relaxed bg-[#0F172A] border border-white/10 p-8 rounded-3xl shadow-xl">
                <p>{displayDescription || (lang === "ar" ? "لا يوجد وصف متاح." : "No description available.")}</p>
              </div>
            )}
            {activeTab === "specs" && (
              <div className="overflow-hidden bg-[#0F172A] border border-white/10 rounded-3xl shadow-xl">
                <table className="w-full text-left text-white">
                  <tbody className="divide-y divide-white/10">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-5 px-8 font-bold w-1/3 text-[#94A3B8]">{t("brand")}</td>
                      <td className="py-5 px-8 font-semibold">{product.brand}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-5 px-8 font-bold text-[#94A3B8]">{t("sku")}</td>
                      <td className="py-5 px-8 font-semibold">{product.sku || (lang === "ar" ? "غير متوفر" : "N/A")}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-5 px-8 font-bold text-[#94A3B8]">{t("weight")}</td>
                      <td className="py-5 px-8 font-semibold">{product.weight ? `${product.weight}g` : (lang === "ar" ? "غير متوفر" : "N/A")}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-5 px-8 font-bold text-[#94A3B8]">{t("stock")}</td>
                      <td className="py-5 px-8 font-semibold">{product.stockQuantity} {t("units")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-[#0F172A] border border-white/10 rounded-3xl p-8 shadow-xl">
                  <h3 className="text-2xl font-black text-white mb-8">
                    {lang === "ar" ? "تقييمات العملاء" : "Customer Reviews"}
                  </h3>
                  
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6 mb-12">
                      {reviews.map((r) => (
                        <div key={r.id} className="bg-black/20 border border-white/5 rounded-2xl p-6 hover:bg-black/40 transition-colors">
                          <div className="flex items-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-5 h-5 ${star <= r.rating ? "text-[#D4AF37] fill-[#D4AF37] filter drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" : "text-white/10"}`} />
                            ))}
                            <span className="font-bold text-white text-lg ml-3">{r.title}</span>
                          </div>
                          <p className="text-[#94A3B8] text-base mb-4 leading-relaxed">{r.comment}</p>
                          <div className="flex items-center gap-3 text-sm text-[#64748B]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8960F] flex items-center justify-center text-black font-bold">
                              {(r.userName || "A")[0]}
                            </div>
                            <span className="font-bold text-[#B6C2D2]">{r.userName || "مستخدم"}</span>
                            <span>•</span>
                            <span>{new Date(r.createdAt!).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#64748B] mb-8 text-lg">{lang === "ar" ? "لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!" : "No reviews yet. Be the first to review!"}</p>
                  )}

                  {user ? (
                    <div className="bg-black/40 rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-[80px]" />
                      <h4 className="font-bold text-white text-xl mb-6 relative z-10">{lang === "ar" ? "أضف تقييمك" : "Add your review"}</h4>
                      <form onSubmit={handleReviewSubmit} className="space-y-6 relative z-10">
                        <div>
                          <label className="block text-sm font-bold text-[#94A3B8] mb-3 uppercase tracking-wider">{lang === "ar" ? "التقييم (من 5)" : "Rating (out of 5)"}</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button type="button" key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                                <Star className={`w-10 h-10 ${star <= reviewForm.rating ? "text-[#D4AF37] fill-[#D4AF37] filter drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "text-white/10"} hover:scale-110 transition-transform`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <input required type="text" placeholder={lang === "ar" ? "عنوان التقييم (مثال: منتج ممتاز)" : "Review Title"} className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 text-white focus:border-[#D4AF37] outline-none transition-colors" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} />
                        </div>
                        <div>
                          <textarea placeholder={lang === "ar" ? "شاركنا رأيك في المنتج..." : "Share your thoughts..."} rows={4} className="w-full px-5 py-4 bg-white/5 rounded-xl border border-white/10 text-white focus:border-[#D4AF37] outline-none resize-none transition-colors" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
                        </div>
                        <button disabled={submittingReview} type="submit" className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-3 w-full sm:w-auto">
                          <Send className="w-5 h-5" />
                          {lang === "ar" ? "إرسال التقييم" : "Submit Review"}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="bg-black/40 rounded-2xl p-8 border border-white/5 text-center">
                      <p className="text-[#94A3B8] mb-6 text-lg">{lang === "ar" ? "يجب تسجيل الدخول لإضافة تقييم." : "You must be logged in to leave a review."}</p>
                      <Link to="/login" className="inline-block px-8 py-3 border border-white/20 text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                        {lang === "ar" ? "تسجيل الدخول" : "Log In"}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts?.items && relatedProducts.items.length > 0 && (
          <div className="mt-24">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-10 text-center">
              {lang === "ar" ? (<>قد <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">يعجبك</span> أيضاً</>) : (<>You May Also <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">Like</span></>)}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.items
                .filter((p: any) => p.id !== product.id)
                .slice(0, 4)
                .map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/product/${p.slug}`}
                    className="relative rounded-[2rem] bg-gradient-to-b from-[#0F172A] to-[#020617] shadow-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-500 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative aspect-square bg-white/5 backdrop-blur-md overflow-hidden rounded-t-[2rem] border-b border-white/5 p-6">
                      <img
                        src={p.image || "/placeholder.png"}
                        alt={p.name}
                        className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6 relative z-10">
                      <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-[#D4AF37] transition-colors">{p.name}</h3>
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778] font-black text-lg mt-2">EGP {p.salePrice || p.price}</p>
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
