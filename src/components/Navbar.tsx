import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import BrandLogo from "@/components/BrandLogo";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Gamepad2,
  Watch,
  Languages,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="w-5 h-5" />,
  Laptop: <Laptop className="w-5 h-5" />,
  Tablet: <Tablet className="w-5 h-5" />,
  Headphones: <Headphones className="w-5 h-5" />,
  Gamepad2: <Gamepad2 className="w-5 h-5" />,
  Watch: <Watch className="w-5 h-5" />,
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { itemCount, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const { t, lang, setLang, isRTL } = useLanguage();
  const location = useLocation();

  const { data: categories } = trpc.category.list.useQuery();
  const { data: searchResults } = trpc.product.search.useQuery(
    { query: searchQuery, limit: 5 },
    { enabled: searchQuery.length > 2 }
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#050505]/85 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-b border-[#D4AF37]/20"
          : "bg-gradient-to-b from-[#050505]/80 to-transparent backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#171717] to-[#C0C0C0] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-[#D4AF37]/30">
              <span className="text-[#D4AF37] font-bold text-xl">Y</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white leading-none">AL-YOUSEF</span>
              <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase mt-0.5">Electronics</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              to="/"
              className="text-[#F8FAFC] hover:text-[#D4AF37] transition-colors text-sm font-medium relative group"
            >
              {t("home")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </Link>
            <Link
              to="/shop"
              className="text-[#F8FAFC] hover:text-[#D4AF37] transition-colors text-sm font-medium relative group"
            >
              {t("shop")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </Link>
            <Link
              to="/track-order"
              className="text-[#F8FAFC] hover:text-[#D4AF37] transition-colors text-sm font-medium relative group"
            >
              {lang === "ar" ? "تتبع الطلب" : "Track Order"}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </Link>
            <div className="relative group">
              <button className="text-[#F8FAFC] hover:text-[#D4AF37] transition-colors text-sm font-medium flex items-center gap-1">
                {t("categories")}
              </button>
              <div className={`absolute top-full ${isRTL ? "right-0" : "left-0"} mt-2 w-56 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden`}>
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#F1F5F9] transition-colors text-[#171717]"
                  >
                    <span className="text-[#D4AF37]">
                      {categoryIcons[cat.icon || ""] || <Smartphone className="w-5 h-5" />}
                    </span>
                    <span className="text-sm font-medium">
                      {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/shop?featured=true"
              className="text-[#F8FAFC] hover:text-[#D4AF37] transition-colors text-sm font-medium relative group"
            >
              {t("deals")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4AF37] transition-all group-hover:w-full" />
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-[#F8FAFC] hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all text-sm font-semibold"
              title="Toggle Language"
            >
              <Languages className="w-4 h-4" />
              {lang === "en" ? "عربي" : "EN"}
            </button>

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#F8FAFC] hover:text-[#D4AF37] hover:bg-white/10 transition-all"
              >
                <Search className="w-5 h-5" />
              </button>
              {searchOpen && (
                <div className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-80 bg-white rounded-xl shadow-xl p-4 z-50`}>
                  <input
                    type="text"
                    placeholder={t("search")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#E2E8F0] focus:border-[#C0C0C0] focus:outline-none text-[#171717]"
                    autoFocus
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                  {searchResults && searchResults.length > 0 && (
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {searchResults.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          className="flex items-center gap-3 p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
                        >
                          <img
                            src={p.image || ""}
                            alt={p.name}
                            className="w-10 h-10 object-contain rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-[#171717]">
                              {lang === "ar" && (p as any).nameAr ? (p as any).nameAr : p.name}
                            </p>
                            <p className="text-xs text-[#D4AF37] font-semibold">
                              SAR {p.salePrice || p.price}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              aria-label={t("cart") || "Cart"}
              onClick={() => setIsOpen(true)}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#F8FAFC] hover:text-[#D4AF37] hover:bg-white/10 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D4AF37] text-[#171717] text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button aria-label="User Menu" className="w-10 h-10 rounded-full flex items-center justify-center text-[#F8FAFC] hover:text-[#D4AF37] hover:bg-white/10 transition-all">
                  <User className="w-5 h-5" />
                </button>
                <div className={`absolute ${isRTL ? "left-0" : "right-0"} top-full mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden`}>
                  <div className="px-4 py-3 border-b border-[#E2E8F0]">
                    <p className="text-sm font-semibold text-[#171717]">{user.name || "User"}</p>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-3 text-sm text-[#171717] hover:bg-[#F1F5F9] transition-colors"
                    >
                      {t("adminDashboard")}
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className="block px-4 py-3 text-sm text-[#171717] hover:bg-[#F1F5F9] transition-colors"
                  >
                    {t("myOrders")}
                  </Link>
                  <Link
                    to="/track-order"
                    className="block px-4 py-3 text-sm text-[#171717] hover:bg-[#F1F5F9] transition-colors"
                  >
                    {lang === "ar" ? "تتبع الطلب" : "Track Order"}
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-[#F1F5F9] transition-colors"
                  >
                    {t("logout")}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Login"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#F8FAFC] hover:text-[#D4AF37] hover:bg-white/10 transition-all"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              aria-label="Mobile Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-[#F8FAFC] hover:bg-white/10 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#171717]/98 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 py-6 space-y-4">
            <Link to="/" className="block text-[#F8FAFC] hover:text-[#D4AF37] py-2 text-lg font-medium">
              {t("home")}
            </Link>
            <Link to="/shop" className="block text-[#F8FAFC] hover:text-[#D4AF37] py-2 text-lg font-medium">
              {t("shop")}
            </Link>
            <Link to="/track-order" className="block text-[#F8FAFC] hover:text-[#D4AF37] py-2 text-lg font-medium">
              {lang === "ar" ? "تتبع الطلب" : "Track Order"}
            </Link>
            <div className="py-2">
              <p className="text-[#94A3B8] text-sm mb-2">{t("categories")}</p>
              <div className="space-y-2 pl-4">
                {categories?.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.slug}`}
                    className="block text-[#F8FAFC] hover:text-[#D4AF37] py-1"
                  >
                    {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/shop?featured=true" className="block text-[#F8FAFC] hover:text-[#D4AF37] py-2 text-lg font-medium">
              {t("deals")}
            </Link>
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-2 text-[#D4AF37] py-2 text-lg font-medium"
            >
              <Languages className="w-5 h-5" />
              {lang === "en" ? "التبديل للعربية" : "Switch to English"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
