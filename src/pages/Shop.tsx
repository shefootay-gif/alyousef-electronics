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
      <div className="bg-gradient-to-r from-[#171717] to-[#0F172A] pt-28 pb-16">
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
              <h3 className="font-bold text-[#171717] mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                {t("filters")}
              </h3>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-[#171717] mb-3">{t("categories")}</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete("category");
                      setSearchParams(newParams);
                    }}
                    className={`block text-sm w-full ${isRTL ? "text-right" : "text-left"} py-1 transition-colors ${
                      !categorySlug ? "text-[#D4AF37] font-semibold" : "text-[#64748B] hover:text-[#171717]"
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
                        categorySlug === cat.slug ? "text-[#D4AF37] font-semibold" : "text-[#64748B] hover:text-[#171717]"
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
                  <h4 className="text-sm font-semibold text-[#171717] mb-3">{t("brands")}</h4>
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
                <h4 className="text-sm font-semibold text-[#171717] mb-3">{t("priceRange")}</h4>
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
                className="w-full py-2.5 text-sm text-[#64748B] hover:text-[#171717] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-all"
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
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow text-sm text-[#171717]"
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
                    className="appearance-none bg-white rounded-lg shadow px-4 py-2 pr-8 text-sm text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
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
                    className={`p-2 ${viewMode === "grid" ? "bg-[#171717] text-white" : "text-[#64748B] hover:text-[#171717]"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-[#171717] text-white" : "text-[#64748B] hover:text-[#171717]"}`}
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
                  className="px-4 py-2 bg-white rounded-lg shadow text-sm text-[#171717] disabled:opacity-50 hover:bg-[#F8FAFC]"
                >
                  {t("previous")}
                </button>
                {[...Array(productsData.totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      page === i + 1
                        ? "bg-[#171717] text-white"
                        : "bg-white text-[#171717] hover:bg-[#F8FAFC] shadow"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(productsData.totalPages, page + 1))}
                  disabled={page === productsData.totalPages}
                  className="px-4 py-2 bg-white rounded-lg shadow text-sm text-[#171717] disabled:opacity-50 hover:bg-[#F8FAFC]"
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
              <h3 className="font-bold text-[#171717]">{t("filters")}</h3>
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
