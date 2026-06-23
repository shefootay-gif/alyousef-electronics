import Layout from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";

export default function PrivacyPolicy() {
  const { lang } = useLanguage();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[#171717] mb-8">
          {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <div className="prose prose-slate max-w-none text-[#64748B] leading-loose space-y-6">
          <p>
            {lang === "ar"
              ? "نحن في مؤسسة اليوسف للإلكترونيات نأخذ خصوصيتك بجدية تامة. توضح هذه السياسة كيف نقوم بجمع واستخدام وحماية بياناتك الشخصية."
              : "At AL-YOUSEF Electronics, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal data."}
          </p>
          <h3 className="text-xl font-bold text-[#171717]">
            {lang === "ar" ? "جمع المعلومات" : "Information Collection"}
          </h3>
          <p>
            {lang === "ar"
              ? "نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند التسجيل في الموقع، أو عند إجراء عملية شراء، أو عند التواصل مع خدمة العملاء. هذه المعلومات تشمل الاسم، البريد الإلكتروني، رقم الهاتف، وعنوان الشحن."
              : "We collect information you provide directly to us when registering, making a purchase, or contacting customer service. This includes your name, email, phone number, and shipping address."}
          </p>
          <h3 className="text-xl font-bold text-[#171717]">
            {lang === "ar" ? "استخدام المعلومات" : "Use of Information"}
          </h3>
          <p>
            {lang === "ar"
              ? "نستخدم معلوماتك لمعالجة طلباتك، وإرسال تحديثات حول حالة الطلب، وتوفير الدعم الفني، وإعلامك بالعروض الترويجية في حال موافقتك على ذلك."
              : "We use your information to process your orders, send order updates, provide customer support, and inform you of promotional offers if you opt-in."}
          </p>
          <h3 className="text-xl font-bold text-[#171717]">
            {lang === "ar" ? "أمان البيانات" : "Data Security"}
          </h3>
          <p>
            {lang === "ar"
              ? "نحن نستخدم أحدث تقنيات التشفير لحماية بياناتك ومعاملاتك المالية لضمان عدم وصول أي أطراف غير مصرح لها إليها."
              : "We use the latest encryption technologies to protect your data and financial transactions to ensure unauthorized parties cannot access them."}
          </p>
        </div>
      </div>
    </Layout>
  );
}
