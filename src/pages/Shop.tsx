import { useState } from "react";
import { useSearchParams } from "react-router";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import Layout from "@/components/Layout";
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  ChevronDown,
  X,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";


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
      <div className="bg-[#020617] relative overflow-hidden pt-32 pb-20 border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
            {activeCategory ? (lang === "ar" && activeCategory.nameAr ? activeCategory.nameAr : activeCategory.name) : featured ? (lang === "ar" ? "مميز" : "Featured") : t("shop")}
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] mx-auto rounded-full mb-6" />
          <p className="text-[#94A3B8] font-medium tracking-wide">
            <Link to="/" className="hover:text-[#D4AF37] transition-colors">{t("home")}</Link>
            <span className="mx-2 text-white/30">{">"}</span>
            <span className="text-[#D4AF37]">{activeCategory ? (lang === "ar" && activeCategory.nameAr ? activeCategory.nameAr : activeCategory.name) : (lang === "ar" ? "جميع المنتجات" : "All Products")}</span>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex gap-8 relative z-10">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 sticky top-28 shadow-2xl">
              <h3 className="font-bold text-white text-xl mb-8 flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
                {t("filters")}
              </h3>

              {/* Categories */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-[#D4AF37] tracking-widest uppercase mb-4">{t("categories")}</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete("category");
                      setSearchParams(newParams);
                    }}
                    className={`block text-sm w-full ${isRTL ? "text-right" : "text-left"} py-2 px-3 rounded-xl transition-all ${
                      !categorySlug ? "bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20" : "text-[#94A3B8] hover:text-white hover:bg-white/5"
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
                      className={`block text-sm w-full ${isRTL ? "text-right" : "text-left"} py-2 px-3 rounded-xl transition-all ${
                        categorySlug === cat.slug ? "bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20" : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              {filters?.brands && filters.brands.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-[#D4AF37] tracking-widest uppercase mb-4">{t("brands")}</h4>
                  <div className="space-y-3">
                    {filters.brands.map((brand) => (
                      <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-black/20 group-hover:border-[#D4AF37] transition-colors">
                          <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="w-3 h-3 rounded-[2px] bg-[#D4AF37] opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm text-[#94A3B8] group-hover:text-white transition-colors">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-[#D4AF37] tracking-widest uppercase mb-4">{t("priceRange")}</h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center text-white text-sm font-mono">
                    {filters?.priceRange?.min || 0}
                  </div>
                  <span className="text-[#94A3B8]">-</span>
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-center text-white text-sm font-mono">
                    {filters?.priceRange?.max || 10000}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSearchParams(new URLSearchParams());
                }}
                className="w-full py-3.5 text-sm font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
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
                  className="lg:hidden flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] border border-white/10 rounded-xl text-sm font-bold text-white shadow-lg"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {t("filters")}
                </button>
                <span className="text-sm font-bold text-[#94A3B8] bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                  {productsData?.total || 0} {lang === "ar" ? "منتج" : "products"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-[#0F172A] border border-white/10 rounded-xl px-5 py-2.5 pr-10 text-sm font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-colors cursor-pointer"
                  >
                    <option value="newest">{t("newest")}</option>
                    <option value="price_asc">{t("priceLowHigh")}</option>
                    <option value="price_desc">{t("priceHighLow")}</option>
                    <option value="rating">{t("topRated")}</option>
                    <option value="name">{t("name")}</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37] pointer-events-none" />
                </div>
                {/* View toggle */}
                <div className="hidden sm:flex bg-[#0F172A] border border-white/10 rounded-xl overflow-hidden shadow-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-[#D4AF37] text-black" : "text-[#94A3B8] hover:text-white hover:bg-white/5"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-[#D4AF37] text-black" : "text-[#94A3B8] hover:text-white hover:bg-white/5"}`}
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
              <div className="flex justify-center mt-16 gap-3">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-6 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-sm font-bold text-white disabled:opacity-50 hover:bg-[#1E293B] transition-colors"
                >
                  {t("previous")}
                </button>
                {[...Array(productsData.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                      page === i + 1
                        ? "bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                        : "bg-[#0F172A] border border-white/10 text-white hover:bg-[#1E293B]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(productsData.totalPages, page + 1))}
                  disabled={page === productsData.totalPages}
                  className="px-6 py-3 bg-[#0F172A] border border-white/10 rounded-xl text-sm font-bold text-white disabled:opacity-50 hover:bg-[#1E293B] transition-colors"
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-[#050505] border-r border-white/10 shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-white text-xl flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#D4AF37]" />
                {t("filters")}
              </h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="space-y-3">
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("category", cat.slug);
                    setSearchParams(newParams);
                    setMobileFiltersOpen(false);
                  }}
                  className={`block text-sm w-full ${isRTL ? "text-right" : "text-left"} py-3 px-4 rounded-xl transition-all ${
                    categorySlug === cat.slug ? "bg-[#D4AF37]/10 text-[#D4AF37] font-bold border border-[#D4AF37]/20" : "text-[#94A3B8] hover:text-white hover:bg-white/5"
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
