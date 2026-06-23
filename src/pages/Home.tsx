import { useEffect, useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/ThemeProvider";
import { pickLocalized } from "@contracts/site-settings";
import FadeIn from "@/components/FadeIn";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import {
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Gamepad2,
  Watch,
  Truck,
  Shield,
  HeadphonesIcon,
  RefreshCw,
  ArrowRight,
  Star,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

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
  const { content } = useTheme();

  const stats = lang === "ar"
    ? ["منتجات أصلية", "ضمان موثوق", "تجربة شراء فاخرة"]
    : ["Authentic Tech", "Trusted Warranty", "Premium Checkout"];

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  return (
    <section className="relative min-h-[850px] flex items-center overflow-hidden bg-[#020617] pt-24 perspective-1000">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(0,212,255,0.1),transparent_30%),linear-gradient(180deg,#020617_0%,#0A1326_50%,#020617_100%)]" />
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent shadow-[0_0_20px_rgba(212,175,55,0.5)]" 
        />
        {/* Animated Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#D4AF37]/20 blur-xl"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -100 - 50, 0],
              x: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 10 + 10,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="grid lg:grid-cols-2 items-center gap-16">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`${lang === "ar" ? "text-right lg:order-2" : "text-left"}`}
          >
            <motion.div variants={textVariants}>
              <p className="inline-flex items-center gap-3 rounded-full border border-[#D4AF37]/40 bg-gradient-to-r from-[#D4AF37]/10 to-transparent px-5 py-2.5 text-xs font-bold tracking-[0.25em] text-[#D4AF37] mb-8 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
                </span>
                {pickLocalized(content.heroEyebrow, lang) || t("premiumElectronics")}
              </p>
            </motion.div>

            <motion.div variants={textVariants}>
              <h1 className="text-5xl sm:text-7xl lg:text-[5rem] font-black text-white leading-[1.1] mb-8 tracking-tight">
                {pickLocalized(content.heroTitle, lang)}
              </h1>
            </motion.div>

            <motion.div variants={textVariants}>
              <p className={`text-lg sm:text-xl text-[#94A3B8] mb-10 leading-relaxed max-w-xl ${lang === "ar" ? "mr-auto" : ""}`}>
                {pickLocalized(content.heroDescription, lang) || t("heroDesc")}
              </p>
            </motion.div>

            <motion.div variants={textVariants}>
              <div className={`flex flex-wrap gap-4 mb-12 ${lang === "ar" ? "justify-end" : ""}`}>
                {stats.map((item) => (
                  <span key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2.5 text-sm font-semibold text-[#E2E8F0] shadow-lg hover:bg-white/10 transition-colors">
                    <Star className="w-4 h-4 text-[#D4AF37]" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div variants={textVariants}>
              <div className={`flex flex-col sm:flex-row gap-5 ${lang === "ar" ? "sm:justify-end" : ""}`}>
                <Link
                  to="/shop"
                  className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-[#D4AF37] via-[#B8960F] to-[#9C7614] text-[#050505] font-black text-lg rounded-2xl shadow-[0_15px_40px_-10px_rgba(212,175,55,0.6)] hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.8)] overflow-hidden transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <span className="relative">{t("shopNow")}</span>
                  <ArrowRight className={`relative w-6 h-6 group-hover:translate-x-1 transition-transform ${lang === "ar" ? "rotate-180 group-hover:-translate-x-1" : ""}`} />
                </Link>
                <Link
                  to="/shop?featured=true"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-2xl border-2 border-white/10 text-white font-bold text-lg hover:bg-white/5 hover:border-[#D4AF37]/50 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1"
                >
                  {lang === "ar" ? "شاهد العروض" : "View Deals"}
                </Link>
              </div>
            </motion.div>
          </motion.div>

          {/* 3D Floating Devices Showcase */}
          <div className="relative min-h-[500px] lg:min-h-[600px] flex items-center justify-center perspective-1000 hidden md:flex">
            {/* Glowing Backdrop */}
            <div className="absolute w-[120%] h-[120%] bg-gradient-to-tr from-[#D4AF37]/20 via-[#0099CC]/10 to-transparent rounded-full blur-[100px] opacity-60 animate-pulse" />
            
            {/* Main Floating Device (Phone Mockup) */}
            <motion.div
              animate={{ 
                y: [-20, 20, -20],
                rotateX: [5, -5, 5],
                rotateY: [-10, 10, -10]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 6, 
                ease: "easeInOut" 
              }}
              className="relative z-20 w-[240px] h-[500px] rounded-[3rem] border-[8px] border-[#171717] bg-[#0F172A] shadow-[0_30px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(212,175,55,0.3)] overflow-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute top-0 inset-x-0 h-7 bg-[#171717] rounded-b-3xl w-1/2 mx-auto z-30 flex items-center justify-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#111]" />
                 <div className="w-10 h-1.5 rounded-full bg-[#111]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] to-[#020617]" />
              <img src={content.heroImage} className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay" alt="Screen" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
              <div className="absolute bottom-10 inset-x-6">
                 <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4 shadow-lg mb-4">
                   <Gamepad2 className="w-full h-full text-[#D4AF37]" />
                 </div>
                 <div className="h-4 w-3/4 bg-white/20 rounded-full mb-2" />
                 <div className="h-4 w-1/2 bg-[#D4AF37]/50 rounded-full" />
              </div>
            </motion.div>

            {/* Secondary Floating Device (Watch/Accessory) */}
            <motion.div
              animate={{ 
                y: [15, -15, 15],
                x: [10, -10, 10],
                rotateZ: [-5, 5, -5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 5, 
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -right-12 top-20 z-30 w-40 h-40 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#D4AF37]/20 to-transparent" />
              <Watch className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
            </motion.div>

            {/* Third Floating Element (Earbuds) */}
            <motion.div
              animate={{ 
                y: [-10, 15, -10],
                x: [-15, 10, -15],
                rotateZ: [10, -10, 10]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 7, 
                ease: "easeInOut",
                delay: 2
              }}
              className="absolute -left-16 bottom-32 z-10 w-32 h-32 rounded-3xl border border-white/10 bg-[#0F172A]/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center"
            >
              <Headphones className="w-16 h-16 text-[#C0C0C0] drop-shadow-[0_0_15px_rgba(192,192,192,0.3)]" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-xs font-semibold text-[#64748B] tracking-widest uppercase">{t("scrollDown")}</span>
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-8 h-12 rounded-full border-2 border-[#64748B] flex justify-center p-1"
        >
          <motion.div className="w-1.5 h-3 bg-[#D4AF37] rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { data: categories } = trpc.category.list.useQuery();
  const { t, lang } = useLanguage();

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2" />
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            {t("browseByCategory")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">{t("category")}</span>
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] mx-auto rounded-full" />
        </div>
        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide px-4 -mx-4">
          {categories?.map((cat, i) => (
            <motion.div 
              key={cat.id} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="snap-start flex-shrink-0"
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group relative w-36 h-44 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col items-center justify-center gap-4 hover:bg-white/10 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#020617] border border-white/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(212,175,55,0.5)] transition-all duration-300">
                  {categoryIcons[cat.icon || ""] || <Smartphone className="w-8 h-8" />}
                </div>
                <span className="relative text-sm font-bold text-white text-center px-2">
                  {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



function FeaturedProductsSection() {
  const { data: featured } = trpc.product.getFeatured.useQuery({ limit: 8 });
  const { t, lang } = useLanguage();

  return (
    <section className="py-20 bg-[#050505] relative border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
            {lang === "ar" ? (
              <><span className="text-[#D4AF37]">منتجات</span> مميزة</>
            ) : (
              <>Featured <span className="text-[#D4AF37]">Products</span></>
            )}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured?.map((product, i) => (
            <FadeIn key={product.id} delay={i * 150} direction="up">
              <ProductCard product={product} />
            </FadeIn>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-3 border border-white/20 text-slate-200 font-semibold rounded-xl hover:bg-white/10 transition-all"
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
  const { t, lang, isRTL } = useLanguage();
  const { content } = useTheme();
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
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] to-[#020617]" />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-[#D4AF37] rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" 
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-8 lg:p-16 shadow-2xl relative overflow-hidden">
          {/* Glass Reflection */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute -left-32 -top-32 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`text-center ${lang === "ar" ? "lg:text-right" : "lg:text-left"} flex-1`}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-2 text-xs font-bold tracking-widest text-[#D4AF37] mb-6">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {t("limitedTimeOffer")}
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                {pickLocalized(content.offerTitle, lang) || t("offerTitle")}
              </h2>
              <div className="inline-block px-6 py-3 rounded-2xl bg-[#0F172A] border border-white/10 text-[#C0C0C0] font-mono text-xl shadow-inner mb-8">
                {lang === "ar" ? "الكود:" : "Code:"} <span className="text-[#D4AF37] font-bold tracking-wider ml-2">{content.offerCode}</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-8"
            >
              <div className={`flex gap-3 sm:gap-5 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                {timerItems.map((item, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-2xl blur-lg group-hover:bg-[#D4AF37]/40 transition-colors" />
                    <div className="relative w-16 h-20 sm:w-24 sm:h-28 rounded-2xl bg-[#020617] border border-white/10 flex flex-col items-center justify-center shadow-xl">
                      <span className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tighter">
                        {String(item.value).padStart(2, "0")}
                      </span>
                      <span className="text-xs sm:text-sm text-[#94A3B8] font-bold uppercase tracking-widest mt-1">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/shop?category=gaming"
                className="group relative inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#050505] font-black text-xl rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative">{t("grabDeal")}</span>
                <ArrowRight className={`relative w-6 h-6 group-hover:translate-x-2 transition-transform ${isRTL ? "rotate-180 group-hover:-translate-x-2" : ""}`} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesBar() {
  const { t, lang } = useLanguage();
  const { content } = useTheme();
  const icons = [
    <Truck className="w-7 h-7" />,
    <Shield className="w-7 h-7" />,
    <HeadphonesIcon className="w-7 h-7" />,
    <RefreshCw className="w-7 h-7" />,
  ];
  const features = content.services.map((service, index) => ({
    icon: icons[index] || <Shield className="w-7 h-7" />,
    title: pickLocalized(service.title, lang) || t("support"),
    desc: pickLocalized(service.description, lang) || t("supportDesc"),
  }));

  return (
    <section className="py-12 bg-[#020617] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <FadeIn key={i} delay={i * 100}>
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#171717] to-[#C0C0C0] flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-200">{f.title}</h3>
                <p className="text-sm text-[#94A3B8]">{f.desc}</p>
              </div>
            </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutUsSection() {
  const { lang, isRTL } = useLanguage();
  const { content } = useTheme();
  
  return (
    <section className="py-24 bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      
      <div className={`max-w-7xl mx-auto px-4 sm:px-8 relative z-10 ${isRTL ? "text-right" : "text-left"}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold tracking-widest text-[#B6C2D2] mb-6">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
              {lang === "ar" ? "قصتنا" : "Our Story"}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
              {pickLocalized(content.aboutTitle, lang)}
            </h2>
            <div className={`w-24 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] mb-8 rounded-full ${isRTL ? "ml-auto" : "mr-auto"}`} />
            
            <p className="text-[#94A3B8] text-lg sm:text-xl leading-relaxed mb-6 font-medium">
              {pickLocalized(content.aboutDescription, lang)}
            </p>
            <p className="text-[#94A3B8] text-lg sm:text-xl leading-relaxed">
              {lang === "ar"
                ? "منذ بدايتنا، التزمنا بتوفير منتجات أصلية 100% من أشهر العلامات التجارية العالمية، مع التركيز على تجربة تسوق فاخرة واستثنائية تجعل من التكنولوجيا جزءاً ممتعاً من حياتك."
                : "Since our beginning, we have committed to offering 100% authentic products from the world's most famous brands, focusing on an exceptional and luxurious shopping experience."}
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/30 to-transparent rounded-[3rem] blur-2xl transform rotate-6" />
            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden border-[6px] border-[#0F172A] shadow-2xl bg-[#0F172A]">
              <img 
                src={content.aboutImage} 
                alt="AL-YOUSEF Electronics Vision" 
                loading="lazy"
                className="w-full h-full object-cover mix-blend-luminosity opacity-80 hover:mix-blend-normal hover:opacity-100 transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-8 left-8 right-8 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <p className="text-white font-bold text-lg">{lang === "ar" ? "جودة مضمونة 100%" : "100% Guaranteed Quality"}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { lang, isRTL } = useLanguage();
  const testimonials = [
    {
      nameEn: "Ahmed Al-Rashid",
      nameAr: "أحمد الراشد",
      location: lang === "ar" ? "القاهرة" : "Cairo",
      rating: 5,
      textEn: "Excellent service and fast delivery! The iPhone 15 Pro Max I ordered arrived in perfect condition.",
      textAr: "خدمة ممتازة وتوصيل سريع! وصل الـ iPhone 15 Pro Max الذي طلبته بحالة مثالية وتغليف فاخر جداً.",
    },
    {
      nameEn: "Fatima Al-Saud",
      nameAr: "فاطمة آل سعود",
      location: lang === "ar" ? "الإسكندرية" : "Alexandria",
      rating: 5,
      textEn: "Best electronics store in Egypt. Great prices and the customer support team was very helpful.",
      textAr: "أفضل متجر إلكترونيات في مصر بلا منازع. أسعار رائعة، وتطبيق التصميم عصري وسهل الاستخدام.",
    },
    {
      nameEn: "Mohammed Al-Qahtani",
      nameAr: "محمد القحطاني",
      location: lang === "ar" ? "الجيزة" : "Giza",
      rating: 4,
      textEn: "I bought a MacBook Pro and the delivery was incredibly fast. The packaging was premium and authentic.",
      textAr: "اشتريت MacBook Pro والتوصيل كان سريعاً للغاية. تجربة المستخدم في المتجر مريحة وتشعرك بالثقة.",
    },
  ];

  return (
    <section className="py-24 bg-[#050505] relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4AF37]/5 rounded-[100%] blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            {lang === "ar" ? (
              <>ماذا يقول <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">عملاؤنا</span></>
            ) : (
              <>What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F8D778]">Customers</span> Say</>
            )}
          </h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] mx-auto rounded-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t_item, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="group relative h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#D4AF37]/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <div className="relative h-full rounded-3xl bg-[#0F172A] border border-white/10 p-8 hover:-translate-y-2 transition-transform duration-500 flex flex-col">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= t_item.rating ? "text-[#D4AF37] fill-[#D4AF37] drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]" : "text-[#334155]"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-[#B6C2D2] text-lg italic mb-8 flex-1 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
                  &ldquo;{lang === "ar" ? t_item.textAr : t_item.textEn}&rdquo;
                </p>
                <div className={`flex items-center gap-4 ${isRTL ? "flex-row" : "flex-row"}`}>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8960F] p-0.5">
                    <div className="w-full h-full rounded-full bg-[#020617] flex items-center justify-center text-white font-bold text-xl">
                      {(lang === "ar" ? t_item.nameAr : t_item.nameEn)[0]}
                    </div>
                  </div>
                  <div className={isRTL ? "text-right" : "text-left"}>
                    <p className="font-bold text-white text-lg">{lang === "ar" ? t_item.nameAr : t_item.nameEn}</p>
                    <p className="text-sm text-[#64748B] font-medium tracking-wide">{t_item.location}</p>
                  </div>
                </div>
              </div>
            </motion.div>
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
      <AboutUsSection />
      <TestimonialsSection />
    </Layout>
  );
}
