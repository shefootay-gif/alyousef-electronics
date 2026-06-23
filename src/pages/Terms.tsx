import Layout from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";

export default function Terms() {
  const { lang } = useLanguage();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-[#171717] mb-8">
          {lang === "ar" ? "الشروط والأحكام" : "Terms of Service"}
        </h1>
        <div className="prose prose-slate max-w-none text-[#64748B] leading-loose space-y-6">
          <p>
            {lang === "ar"
              ? "مرحباً بك في مؤسسة اليوسف للإلكترونيات. باستخدامك لهذا الموقع، فإنك توافق على الشروط والأحكام التالية. يُرجى قراءتها بعناية."
              : "Welcome to AL-YOUSEF Electronics. By using this website, you agree to the following terms and conditions. Please read them carefully."}
          </p>
          <h3 className="text-xl font-bold text-[#171717]">
            {lang === "ar" ? "الحسابات والتسجيل" : "Accounts & Registration"}
          </h3>
          <p>
            {lang === "ar"
              ? "يجب أن تكون المعلومات المقدمة عند إنشاء الحساب دقيقة وحديثة. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور."
              : "Information provided during registration must be accurate and up to date. You are responsible for maintaining the confidentiality of your account information and password."}
          </p>
          <h3 className="text-xl font-bold text-[#171717]">
            {lang === "ar" ? "الطلبات والدفع" : "Orders & Payments"}
          </h3>
          <p>
            {lang === "ar"
              ? "نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب، بما في ذلك توفر المنتج أو وجود أخطاء في التسعير. يجب سداد المبالغ إما عند الاستلام أو عبر بوابات الدفع الإلكترونية المعتمدة."
              : "We reserve the right to refuse or cancel any order for any reason, including product availability or pricing errors. Payments must be made either on delivery or through approved electronic payment gateways."}
          </p>
          <h3 className="text-xl font-bold text-[#171717]">
            {lang === "ar" ? "الملكية الفكرية" : "Intellectual Property"}
          </h3>
          <p>
            {lang === "ar"
              ? "جميع المحتويات المعروضة على الموقع من نصوص، صور، وشعارات هي ملك لمؤسسة اليوسف ولا يجوز استخدامها دون إذن مسبق."
              : "All content displayed on the website, including text, images, and logos, is the property of AL-YOUSEF and may not be used without prior permission."}
          </p>
        </div>
      </div>
    </Layout>
  );
}
