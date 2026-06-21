import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/hooks/useLanguage";
import { Smartphone, Laptop, Tablet, Headphones, Gamepad2, Watch, Mail, MapPin, Phone } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  smartphones: <Smartphone className="w-4 h-4" />,
  laptops: <Laptop className="w-4 h-4" />,
  tablets: <Tablet className="w-4 h-4" />,
  audio: <Headphones className="w-4 h-4" />,
  gaming: <Gamepad2 className="w-4 h-4" />,
  accessories: <Watch className="w-4 h-4" />,
};

export default function Footer() {
  const { data: categories } = trpc.category.list.useQuery();
  const { data: contactLinks } = trpc.settings.getContactLinks.useQuery();
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#050505] pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-70">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 h-72 w-72 rounded-full bg-[#C0C0C0]/10 blur-3xl" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="AL-YOUSEF Electronics home">
              <BrandLogo showTagline />
            </Link>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
              {lang === "ar"
                ? "متجر إلكترونيات فاخر يجمع بين الهواتف، الحواسيب، الملحقات، الألعاب والأجهزة الذكية بهوية ذهبية وكحلية واضحة."
                : "A premium electronics destination for smartphones, laptops, accessories, gaming, and smart devices with a refined gold and navy identity."}
            </p>
            <div className="space-y-2">
              {contactLinks?.whatsapp && (
                <a href={`https://wa.me/${contactLinks.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#94A3B8] hover:text-[#D4AF37] transition-colors text-sm">
                  <Phone className="w-4 h-4" /> {lang === "ar" ? "واتساب" : "WhatsApp"}
                </a>
              )}
              {contactLinks?.website && (
                <a href={contactLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[#94A3B8] hover:text-[#D4AF37] transition-colors text-sm">
                  <MapPin className="w-4 h-4" /> {lang === "ar" ? "الموقع الإلكتروني" : "Website"}
                </a>
              )}
              {!contactLinks?.whatsapp && !contactLinks?.website && (
                <p className="text-[#64748B] text-xs italic">{lang === "ar" ? "سيتم إضافة روابط التواصل قريباً" : "Contact links will be added soon"}</p>
              )}
            </div>
          </div>

          {/* {lang === "ar" ? "روابط سريعة" : "Quick Links"} */}
          <div>
            <h4 className="text-[#F8FAFC] font-semibold mb-4 text-sm uppercase tracking-wider">{lang === "ar" ? "روابط سريعة" : "Quick Links"}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-slate-400 hover:text-white transition-colors">
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors">
                  {lang === "ar" ? "اتصل بنا" : "Contact Us"}
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="text-slate-400 hover:text-white transition-colors">
                  {t("returnPolicy")}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
                  {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-white transition-colors">
                  {lang === "ar" ? "الشروط والأحكام" : "Terms of Service"}
                </Link>
              </li>
            </ul>
          </div>

          {/* {lang === "ar" ? "التصنيفات" : "Categories"} */}
          <div>
            <h4 className="text-[#F8FAFC] font-semibold mb-4 text-sm uppercase tracking-wider">{lang === "ar" ? "التصنيفات" : "Categories"}</h4>
            <ul className="space-y-2">
              {categories?.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors text-sm flex items-center gap-2"
                  >
                    {categoryIcons[cat.slug]}
                    {lang === "ar" && cat.nameAr ? cat.nameAr : cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[#F8FAFC] font-semibold mb-4 text-sm uppercase tracking-wider">{lang === "ar" ? "تابع أحدث العروض" : "Stay Updated"}</h4>
            <p className="text-[#94A3B8] text-sm mb-4">{lang === "ar" ? "اشترك ليصلك جديد المنتجات والعروض الحصرية." : "Subscribe for exclusive deals and new arrivals."}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={lang === "ar" ? "بريدك الإلكتروني" : "Your email"}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-[#F8FAFC] placeholder-[#64748B] text-sm focus:outline-none focus:border-[#C0C0C0]"
              />
              <button className="px-4 py-2 bg-gradient-to-r from-[#C0C0C0] to-[#0099CC] text-white rounded-lg hover:shadow-lg transition-all">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#64748B] text-sm">
            &copy; {new Date().getFullYear()} AL-YOUSEF Electronics. {lang === "ar" ? "جميع الحقوق محفوظة." : "All Rights Reserved."}
          </p>
          <div className="flex items-center gap-4">
            {contactLinks?.snapchat && (
              <a href={contactLinks.snapchat} target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors">
                <span className="sr-only">Snapchat</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.206 1c.577 0 2.553.566 4.27 2.984C17.67 5.71 18.3 7.7 18.445 9.84c.023.35.034.7.034 1.05 0 .65-.05 1.3-.148 1.937.232.162.55.208.834.123.464-.138.89-.48 1.196-.943.17-.257.463-.372.733-.283.27.09.42.353.36.623-.04.18-.22.71-.758 1.24-.676.664-1.63 1.087-2.68 1.19-.193.426-.12.96.21 1.43.47.68 1.34.97 2.12 1.22.37.12.56.52.43.89-.1.3-.39.48-.69.44-.57-.07-1.12-.01-1.63.18-.82.31-1.38.88-1.93 1.44-.74.76-1.51 1.55-2.76 1.97-.44.15-.9.22-1.36.22-.46 0-.92-.07-1.36-.22-1.25-.42-2.02-1.21-2.76-1.97-.55-.56-1.11-1.13-1.93-1.44-.51-.19-1.06-.25-1.63-.18-.3.04-.59-.14-.69-.44-.13-.37.06-.77.43-.89.78-.25 1.65-.54 2.12-1.22.33-.47.4-1.01.21-1.43-1.05-.1-2.004-.526-2.68-1.19-.538-.53-.718-1.06-.758-1.24-.06-.27.09-.533.36-.623.27-.09.563.026.733.283.306.463.732.805 1.196.943.284.085.602.04.834-.123-.098-.637-.148-1.287-.148-1.937 0-.35.01-.7.034-1.05.145-2.14.775-4.13 1.97-5.856C9.241 1.566 11.217 1 11.794 1h.412z"/></svg>
              </a>
            )}
            {contactLinks?.twitter && (
              <a href={contactLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors">
                <span className="sr-only">X (Twitter)</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            )}
            {contactLinks?.telegram && (
              <a href={contactLinks.telegram} target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#D4AF37] transition-colors">
                <span className="sr-only">Telegram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
