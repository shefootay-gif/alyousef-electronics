import { useState } from "react";
import { useSearchParams } from "react-router";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import Layout from "@/components/Layout";
import {
  Star,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
} from "lucide-react";
import { toast } from "sonner";

function ProductCard({ product }: { product: any }) {
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

  return (
    <div className="rounded-2xl bg-white shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative aspect-square bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] overflow-hidden">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.image || "/placeholder.png"}
            alt={product.name}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        </Link>
        {salePrice && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
            SALE
          </span>
        )}
        <button
          onClick={() => setLiked(!liked)}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md ${
            liked ? "bg-red-500 text-white" : "bg-white text-[#64748B] hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
        </button>
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#1A2A44]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#1A2A44] font-bold text-sm rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {t("addToCart")}
          </button>
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs text-[#94A3B8] mb-1">{lang === "ar" && product.category?.nameAr ? product.category.nameAr : product.category?.name}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-base font-semibold text-[#1A2A44] line-clamp-1 hover:text-[#D4AF37] transition-colors">
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
          <span className="text-xs text-[#94A3B8] ml-1">({product.reviewCount || 0})</span>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xl font-bold text-[#D4AF37]">SAR {salePrice || price}</span>
          {salePrice && <span className="text-sm text-[#94A3B8] line-through">SAR {price}</span>}
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const { t, lang, isRTL } = useLanguage();

  const categorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";
  const featured = searchParams.get("featured");

  const { data: categories } = trpc.category.list.useQuery();
  const { data: filters } = trpc.product.getFilters.useQuery();

  const { data: categoryData } = trpc.category.getBySlug.useQuery(
    { slug: categorySlug || "" },
    { enabled: !!categorySlug }
  );

  const { data: productsData, isLoading } = trpc.product.list.useQuery({
    categoryId: categoryData?.id,
    search: searchQuery || undefined,
    sort: sortBy as any,
    page,
    limit: 12,
    status: "active",
  });

  const activeCategory = categoryData;

  return (
    <Layout>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A2A44] to-[#0F172A] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#F8FAFC] mb-2">
            {activeCategory ? (lang === "ar" && activeCategory.nameAr ? activeCategory.nameAr : activeCategory.name) : featured ? (lang === "ar" ? "مميز" : "Featured") : t("shop")}
          </h1>
          <p className="text-[#94A3B8]">
            <Link to="/" className="hover:text-[#D4AF37] transition-colors">{t("home")}</Link>
            {" > "}
            <span className="text-[#F8FAFC]">{activeCategory ? (lang === "ar" && activeCategory.nameAr ? activeCategory.nameAr : activeCategory.name) : (lang === "ar" ? "جميع المنتجات" : "All Products")}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="font-bold text-[#1A2A44] mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                {t("filters")}
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#1A2A44] mb-3">{t("categories")}</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete("category");
                      setSearchParams(newParams);
                    }}
                    className={`block text-sm w-full ${isRTL ? "text-right" : "text-left"} py-1 transition-colors ${
                      !categorySlug ? "text-[#D4AF37] font-semibold" : "text-[#64748B] hover:text-[#1A2A44]"
                    }`}
                  >
                    {t("allCategories")}
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set("category", cat.slug);
                        setSearchParams(newParams);
                      }}
                      className={`block text-sm w-full ${isRTL ? "text-right" : "text-left"} py-1 transition-colors ${
                        categorySlug === cat.slug ? "text-[#D4AF37] font-semibold" : "text-[#64748B] hover:text-[#1A2A44]"
                      }`}
                    >
                      {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {filters?.brands && filters.brands.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-[#1A2A44] mb-3">{t("brands")}</h4>
                  <div className="space-y-2">
                    {filters.brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-[#E2E8F0] text-[#D4AF37] focus:ring-[#D4AF37]" />
                        <span className="text-sm text-[#64748B]">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#1A2A44] mb-3">{t("priceRange")}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#94A3B8]">SAR {filters?.priceRange?.min || 0}</span>
                  <span className="text-xs text-[#94A3B8]">-</span>
                  <span className="text-xs text-[#94A3B8]">SAR {filters?.priceRange?.max || 10000}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                }}
                className="w-full py-2.5 text-sm text-[#64748B] hover:text-[#1A2A44] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-all"
              >
                {t("resetAll")}
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow text-sm text-[#1A2A44]"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("filters")}
                </button>
                <span className="text-sm text-[#64748B]">
                  {productsData?.total || 0} {lang === "ar" ? "منتج" : "products"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white rounded-lg shadow px-4 py-2 pr-8 text-sm text-[#1A2A44] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="newest">{t("newest")}</option>
                    <option value="price_asc">{t("priceLowHigh")}</option>
                    <option value="price_desc">{t("priceHighLow")}</option>
                    <option value="rating">{t("topRated")}</option>
                    <option value="name">{t("name")}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
                </div>
                {/* View toggle */}
                <div className="hidden sm:flex bg-white rounded-lg shadow overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-[#1A2A44] text-white" : "text-[#64748B] hover:text-[#1A2A44]"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-[#1A2A44] text-white" : "text-[#64748B] hover:text-[#1A2A44]"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl bg-white shadow-lg overflow-hidden animate-pulse">
                    <div className="aspect-square bg-[#E2E8F0]" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-[#E2E8F0] rounded w-3/4" />
                      <div className="h-4 bg-[#E2E8F0] rounded w-1/2" />
                      <div className="h-6 bg-[#E2E8F0] rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productsData?.items && productsData.items.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}>
                {productsData.items.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-[#64748B] text-lg">{t("noProductsFound")}</p>
                <p className="text-[#94A3B8] text-sm mt-2">{t("adjustFilters")}</p>
              </div>
            )}

            {/* Pagination */}
            {productsData && productsData.totalPages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white rounded-lg shadow text-sm text-[#1A2A44] disabled:opacity-50 hover:bg-[#F8FAFC]"
                >
                  {t("previous")}
                </button>
                {[...Array(productsData.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      page === i + 1
                        ? "bg-[#1A2A44] text-white"
                        : "bg-white text-[#1A2A44] hover:bg-[#F8FAFC] shadow"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(productsData.totalPages, page + 1))}
                  disabled={page === productsData.totalPages}
                  className="px-4 py-2 bg-white rounded-lg shadow text-sm text-[#1A2A44] disabled:opacity-50 hover:bg-[#F8FAFC]"
                >
                  {t("next")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-[#1A2A44]">{t("filters")}</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <div className="space-y-2">
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("category", cat.slug);
                    setSearchParams(newParams);
                    setMobileFiltersOpen(false);
                  }}
                  className={`block text-sm w-full ${isRTL ? "text-right" : "text-left"} py-2 px-3 rounded-lg transition-colors ${
                    categorySlug === cat.slug ? "bg-[#F1F5F9] text-[#D4AF37] font-semibold" : "text-[#64748B]"
                  }`}
                >
                  {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
