import { useLanguage } from "@/hooks/useLanguage";
import { ShieldCheck, Truck, Clock, RefreshCcw } from "lucide-react";

export default function About() {
  const { lang, isRTL, t } = useLanguage();

  return (
    <div className={`container mx-auto px-4 py-12 ${isRTL ? "text-right" : "text-left"}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-slate-900">{t("aboutUs")}</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">
            {lang === "ar" ? "قصتنا" : "Our Story"}
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            {lang === "ar" 
              ? "تأسست شركة اليوسف للإلكترونيات برؤية واضحة: تقديم أفضل وأحدث التقنيات لعملائنا في مصر. منذ بدايتنا، التزمنا بتوفير منتجات أصلية 100% من أشهر العلامات التجارية العالمية، مع التركيز على تجربة تسوق استثنائية."
              : "AL-YOUSEF Electronics was founded with a clear vision: to provide the best and latest technology to our customers in Egypt. Since our beginning, we have committed to offering 100% authentic products from the world's most famous brands, focusing on an exceptional shopping experience."}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {lang === "ar"
              ? "نحن نفخر بكوننا الوجهة الموثوقة لكل ما يخص الأجهزة الذكية، الحواسيب، والملحقات التقنية. فريقنا يعمل على مدار الساعة لضمان وصول أحدث الإصدارات إليك بأفضل الأسعار وأسرع وقت ممكن."
              : "We pride ourselves on being the trusted destination for all things related to smart devices, computers, and tech accessories. Our team works around the clock to ensure the latest releases reach you at the best prices and in the fastest possible time."}
          </p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-slate-900 text-center">
          {lang === "ar" ? "لماذا تختارنا؟" : "Why Choose Us?"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-slate-50 p-6 rounded-xl flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">{lang === "ar" ? "منتجات أصلية ومضمونة" : "Authentic & Guaranteed"}</h3>
              <p className="text-slate-600 text-sm">{lang === "ar" ? "جميع أجهزتنا تأتي بضمان الوكيل الرسمي في المملكة لضمان حقك وراحتك." : "All our devices come with the official dealer warranty in the Kingdom to ensure your rights and peace of mind."}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-xl flex items-start gap-4">
            <div className="bg-amber-100 p-3 rounded-lg text-amber-600 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">{lang === "ar" ? "توصيل سريع وآمن" : "Fast & Secure Delivery"}</h3>
              <p className="text-slate-600 text-sm">{lang === "ar" ? "نوفر خدمة الشحن السريع والمؤمن لجميع مناطق المملكة لضمان وصول طلبك بأمان." : "We provide fast and insured shipping to all regions of the Kingdom to ensure your order arrives safely."}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl flex items-start gap-4">
            <div className="bg-cyan-100 p-3 rounded-lg text-cyan-600 shrink-0">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">{lang === "ar" ? "سياسة استرجاع مرنة" : "Flexible Returns"}</h3>
              <p className="text-slate-600 text-sm">{lang === "ar" ? "يمكنك استرجاع واستبدال المنتجات بسهولة تامة خلال فترة الاسترجاع المحددة." : "You can easily return and exchange products within the specified return period."}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl flex items-start gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">{lang === "ar" ? "دعم فني متواصل" : "24/7 Support"}</h3>
              <p className="text-slate-600 text-sm">{lang === "ar" ? "فريق خدمة العملاء متواجد دائماً للرد على استفساراتك ومساعدتك في اختيار ما يناسبك." : "Our customer service team is always available to answer your inquiries and help you choose what suits you."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
