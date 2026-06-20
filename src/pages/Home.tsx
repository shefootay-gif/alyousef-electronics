import { useEffect, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCart } from "@/hooks/useCart";
import { useLanguage } from "@/hooks/useLanguage";
import Layout from "@/components/Layout";
import {
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Gamepad2,
  Watch,
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  HeadphonesIcon,
  RefreshCw,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

const categoryIcons: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="w-7 h-7" />,
  Laptop: <Laptop className="w-7 h-7" />,
  Tablet: <Tablet className="w-7 h-7" />,
  Headphones: <Headphones className="w-7 h-7" />,
  Gamepad2: <Gamepad2 className="w-7 h-7" />,
  Watch: <Watch className="w-7 h-7" />,
};

function HeroSection() {
  const { t, lang } = useLanguage();

  const stats = lang === "ar"
    ? ["منتجات أصلية", "ضمان موثوق", "تجربة شراء فاخرة"]
    : ["Authentic Tech", "Trusted Warranty", "Premium Checkout"];

  return (
    <section className="relative min-h-[760px] flex items-center overflow-hidden bg-[#071427] pt-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_34%),radial-gradient(circle_at_75%_20%,rgba(0,212,255,0.16),transparent_30%),linear-gradient(135deg,#071427_0%,#0D1E36_52%,#051020_100%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/55 to-transparent" />
        <div className="absolute right-[-8rem] top-24 h-80 w-80 rounded-full border border-[#D4AF37]/20" />
        <div className="absolute left-[-6rem] bottom-10 h-72 w-72 rounded-full border border-[#00D4FF]/15" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="grid lg:grid-cols-2 items-center gap-14">
          <div className={`${lang === "ar" ? "text-right lg:order-2" : "text-left"}`}>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/5 px-4 py-2 text-xs font-bold tracking-[0.25em] text-[#D4AF37] mb-6">
              <span className="h-2 w-2 rounded-full bg-[#00D4FF] shadow-[0_0_14px_rgba(0,212,255,0.9)]" />
              {t("premiumElectronics")}
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#F8FAFC] leading-tight mb-6">
              {lang === "ar" ? (
                <>تجربة إلكترونيات <span className="text-[#D4AF37]">فاخرة</span> لمتجر عصري</>
              ) : (
                <>Premium <span className="text-[#D4AF37]">electronics</span> for modern lifestyles</>
              )}
            </h1>
            <p className={`text-lg text-[#B6C2D2] mb-8 leading-relaxed max-w-xl ${lang === "ar" ? "mr-auto" : ""}`}>
              {lang === "ar"
                ? "هوية AL-YOUSEF الذهبية والكحلية بتصميم مناسب للموقع: واضح، سريع القراءة، ومرتبط مباشرة بعالم الهواتف والحواسيب والملحقات الذكية."
                : t("heroDesc")}
            </p>

            <div className={`flex flex-wrap gap-3 mb-9 ${lang === "ar" ? "justify-end" : ""}`}>
              {stats.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-[#F8FAFC]">
                  {item}
                </span>
              ))}
            </div>

            <div className={`flex flex-col sm:flex-row gap-4 ${lang === "ar" ? "sm:justify-end" : ""}`}>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#F8D778] via-[#D4AF37] to-[#A77D16] text-[#071427] font-extrabold rounded-2xl shadow-[0_12px_38px_rgba(212,175,55,0.28)] hover:shadow-[0_16px_48px_rgba(212,175,55,0.42)] hover:-translate-y-0.5 transition-all duration-300"
              >
                {t("shopNow")}
                <ArrowRight className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
              </Link>
              <Link
                to="/shop?featured=true"
                className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border border-[#D4AF37]/35 text-[#F8FAFC] font-bold hover:bg-white/10 hover:border-[#D4AF37] transition-all"
              >
                {lang === "ar" ? "شاهد العروض" : "View Deals"}
              </Link>
            </div>
          </div>

          <div className="relative min-h-[420px] lg:min-h-[540px] flex items-center justify-center">
            <div className="absolute h-80 w-80 rounded-full bg-[#00D4FF]/10 blur-3xl" />
            <div className="absolute h-[28rem] w-[28rem] rounded-full border border-[#D4AF37]/20" />
            <div className="relative w-full max-w-[560px] rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="relative flex items-end justify-center gap-[-20px]">
                <div className="relative z-20 -mr-8 flex h-[290px] w-[150px] flex-col rounded-[2rem] border-2 border-[#D4AF37] bg-[#061125] shadow-[0_0_36px_rgba(0,212,255,0.18)]">
                  <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-[#D4AF37]/80" />
                  <div className="flex flex-1 items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#D4AF37]/70 bg-[#071427] shadow-[0_0_22px_rgba(0,212,255,0.25)]">
                      <span className="text-5xl font-black text-[#D4AF37]">Y</span>
                    </div>
                  </div>
                </div>
                <div className="relative z-10 w-[360px]">
                  <div className="h-[230px] rounded-t-[1.6rem] border-2 border-[#D4AF37] bg-[#061125] shadow-[0_0_32px_rgba(0,212,255,0.20)]">
                    <div className="m-5 h-[180px] rounded-xl bg-gradient-to-br from-[#0D1E36] to-[#020617] border border-white/5" />
                  </div>
                  <div className="h-12 rounded-b-2xl bg-gradient-to-r from-[#9C7614] via-[#D4AF37] to-[#FFE8A3] shadow-[0_18px_38px_rgba(0,0,0,0.35)]">
                    <div className="mx-auto h-3 w-24 rounded-b-xl bg-[#071427]/70" />
                  </div>
                </div>
              </div>
              <div className="relative mt-8 grid grid-cols-3 gap-3 text-center text-xs font-semibold text-[#B6C2D2]">
                {(lang === "ar" ? ["هواتف", "لابتوبات", "ملحقات"] : ["Phones", "Laptops", "Accessories"]).map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-[#071427]/70 px-3 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-[#D4AF37]" />
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { data: categories } = trpc.category.list.useQuery();
  const { t, lang } = useLanguage();

  return (
    <section className="py-16 bg-[#F1F5F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A44] text-center mb-12">
          {t("browseByCategory")} <span className="text-[#D4AF37]">{t("category")}</span>
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {categories?.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="flex-shrink-0 w-32 h-36 rounded-2xl bg-white shadow-lg flex flex-col items-center justify-center gap-3 hover:scale-110 hover:shadow-xl hover:border-2 hover:border-[#D4AF37] transition-all duration-300 snap-start group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A2A44] to-[#00D4FF] flex items-center justify-center text-white group-hover:shadow-lg transition-all">
                {categoryIcons[cat.icon || ""] || <Smartphone className="w-7 h-7" />}
              </div>
              <span className="text-sm font-semibold text-[#1A2A44] text-center px-2">
                {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

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
            alt={displayName}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />
        </Link>

        {salePrice && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg">
            {lang === "ar" ? "تخفيض" : "SALE"}
          </span>
        )}
        {product.isFeatured && !salePrice && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-[#00D4FF] text-white text-xs font-bold rounded-lg">
            {lang === "ar" ? "جديد" : "NEW"}
          </span>
        )}

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setLiked(!liked)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              liked ? "bg-red-500 text-white" : "bg-white text-[#64748B] hover:text-red-500"
            } shadow-md`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#1A2A44]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
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
          <span className="text-xs text-[#94A3B8] ml-1">
            ({product.reviewCount || 0})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span className="text-xl font-bold text-[#D4AF37]">
            SAR {salePrice || price}
          </span>
          {salePrice && (
            <span className="text-sm text-[#94A3B8] line-through">
              SAR {price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedProductsSection() {
  const { data: featured } = trpc.product.getFeatured.useQuery({ limit: 8 });
  const { t, lang } = useLanguage();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A44] mb-4">
            {lang === "ar" ? (
              <><span className="text-[#D4AF37]">منتجات</span> مميزة</>
            ) : (
              <>Featured <span className="text-[#D4AF37]">Products</span></>
            )}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#1A2A44] text-[#1A2A44] font-semibold rounded-xl hover:bg-[#1A2A44] hover:text-white transition-all"
          >
            {t("viewAllProducts")}
            <ArrowRight className={`w-4 h-4 ${lang === "ar" ? "rotate-180" : ""}`} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SpecialOfferSection() {
  const { t, lang } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 14, minutes: 35, seconds: 42 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timerItems = [
    { value: timeLeft.days, label: t("days") },
    { value: timeLeft.hours, label: t("hours") },
    { value: timeLeft.minutes, label: t("min") },
    { value: timeLeft.seconds, label: t("sec") },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-[#1A2A44] to-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37] rounded-full blur-[128px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D4FF] rounded-full blur-[128px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className={`text-center ${lang === "ar" ? "lg:text-right" : "lg:text-left"}`}>
            <p className="text-xs font-bold tracking-[0.3em] text-[#D4AF37] mb-3">
              {t("limitedTimeOffer")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] mb-3">
              {t("offerTitle")}
            </h2>
            <p className="text-lg text-[#00D4FF] font-semibold">
              {lang === "ar" ? "استخدم الكود: GAMING15" : "Use code: GAMING15"}
            </p>
          </div>

          <div className="flex gap-3">
            {timerItems.map((item) => (
              <div
                key={item.label}
                className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-white/10 backdrop-blur flex flex-col items-center justify-center"
              >
                <span className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
                  {String(item.value).padStart(2, "0")}
                </span>
                <span className="text-xs text-[#94A3B8]">{item.label}</span>
              </div>
            ))}
          </div>

          <Link
            to="/shop?category=gaming"
            className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#1A2A44] font-bold rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_30px_rgba(212,175,55,0.5)] hover:scale-105 transition-all animate-pulse"
          >
            {t("grabDeal")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeaturesBar() {
  const { t } = useLanguage();
  const features = [
    { icon: <Truck className="w-7 h-7" />, title: t("freeDelivery"), desc: t("freeDeliveryDesc") },
    { icon: <Shield className="w-7 h-7" />, title: t("securePayment"), desc: t("securePaymentDesc") },
    { icon: <HeadphonesIcon className="w-7 h-7" />, title: t("support"), desc: t("supportDesc") },
    { icon: <RefreshCw className="w-7 h-7" />, title: t("easyReturns"), desc: t("easyReturnsDesc") },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A2A44] to-[#00D4FF] flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <div>
                <h4 className="text-base font-semibold text-[#1A2A44]">{f.title}</h4>
                <p className="text-sm text-[#94A3B8]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { lang } = useLanguage();
  const testimonials = [
    {
      nameEn: "Ahmed Al-Rashid",
      nameAr: "أحمد الراشد",
      location: lang === "ar" ? "الرياض" : "Riyadh",
      rating: 5,
      textEn: "Excellent service and fast delivery! The iPhone 15 Pro Max I ordered arrived in perfect condition.",
      textAr: "خدمة ممتازة وتوصيل سريع! وصل الـ iPhone 15 Pro Max الذي طلبته بحالة مثالية.",
    },
    {
      nameEn: "Fatima Al-Saud",
      nameAr: "فاطمة آل سعود",
      location: lang === "ar" ? "جدة" : "Jeddah",
      rating: 5,
      textEn: "Best electronics store in Saudi Arabia. Great prices and the customer support team was very helpful.",
      textAr: "أفضل متجر إلكترونيات في المملكة العربية السعودية. أسعار رائعة وفريق دعم العملاء مفيد جداً.",
    },
    {
      nameEn: "Mohammed Al-Qahtani",
      nameAr: "محمد القحطاني",
      location: lang === "ar" ? "الدمام" : "Dammam",
      rating: 4,
      textEn: "I bought a MacBook Pro and the delivery was incredibly fast. The packaging was premium and authentic.",
      textAr: "اشتريت MacBook Pro والتوصيل كان سريعاً للغاية. التغليف كان فاخراً والمنتج أصلي.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-[#F1F5F9] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A2A44] mb-4">
            {lang === "ar" ? (
              <>ماذا يقول <span className="text-[#D4AF37]">عملاؤنا</span></>
            ) : (
              <>What Our <span className="text-[#D4AF37]">Customers</span> Say</>
            )}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t_item, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= t_item.rating ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#E2E8F0]"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[#1A2A44] italic mb-6 leading-relaxed">
                &ldquo;{lang === "ar" ? t_item.textAr : t_item.textEn}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A2A44] to-[#00D4FF] flex items-center justify-center text-white font-bold">
                  {(lang === "ar" ? t_item.nameAr : t_item.nameEn)[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#1A2A44]">{lang === "ar" ? t_item.nameAr : t_item.nameEn}</p>
                  <p className="text-sm text-[#94A3B8]">{t_item.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <SpecialOfferSection />
      <FeaturesBar />
      <TestimonialsSection />
    </Layout>
  );
}
