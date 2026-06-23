import { useState } from "react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/hooks/useLanguage";
import { trpc } from "@/providers/trpc";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const { lang, t } = useLanguage();
  const { data: contactLinks } = (trpc.settings as any).getContactLinks.useQuery();
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending message
    setTimeout(() => {
      setLoading(false);
      toast.success(lang === "ar" ? "تم إرسال رسالتك بنجاح!" : "Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    }, 1000);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#171717] mb-4">
            {lang === "ar" ? "تواصل معنا" : "Contact Us"}
          </h1>
          <p className="text-[#64748B] max-w-2xl mx-auto">
            {lang === "ar"
              ? "نحن هنا لمساعدتك! إذا كان لديك أي سؤال أو استفسار، لا تتردد في التواصل معنا عبر النموذج أدناه أو باستخدام وسائل التواصل المتاحة."
              : "We are here to help! If you have any questions or inquiries, feel free to contact us via the form below or using our contact info."}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-[#171717] mb-6">
              {lang === "ar" ? "معلومات التواصل" : "Contact Information"}
            </h3>
            <div className="space-y-6">
              {contactLinks?.whatsapp && (
                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-[#E2E8F0]">
                  <div className="w-12 h-12 rounded-xl bg-[#C0C0C0]/10 flex items-center justify-center text-[#C0C0C0] flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#171717] mb-1">{lang === "ar" ? "رقم الهاتف / واتساب" : "Phone / WhatsApp"}</h4>
                    <p className="text-[#64748B]">{contactLinks.whatsapp}</p>
                  </div>
                </div>
              )}
              {contactLinks?.website && (
                <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-[#E2E8F0]">
                  <div className="w-12 h-12 rounded-xl bg-[#C0C0C0]/10 flex items-center justify-center text-[#C0C0C0] flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#171717] mb-1">{lang === "ar" ? "الموقع الإلكتروني" : "Website"}</h4>
                    <p className="text-[#64748B]">{contactLinks.website}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow-sm border border-[#E2E8F0]">
                <div className="w-12 h-12 rounded-xl bg-[#C0C0C0]/10 flex items-center justify-center text-[#C0C0C0] flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#171717] mb-1">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</h4>
                  <p className="text-[#64748B]">support@alyousef.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#E2E8F0]">
            <h3 className="text-2xl font-bold text-[#171717] mb-6">
              {lang === "ar" ? "أرسل لنا رسالة" : "Send us a message"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">
                  {lang === "ar" ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">
                  {lang === "ar" ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#171717] mb-1">
                  {lang === "ar" ? "الرسالة" : "Message"}
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8960F] text-[#171717] font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70"
              >
                {loading ? (
                  lang === "ar" ? "جاري الإرسال..." : "Sending..."
                ) : (
                  <>
                    <Send className={`w-5 h-5 ${lang === "ar" ? "rotate-180" : ""}`} />
                    {lang === "ar" ? "إرسال الرسالة" : "Send Message"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
