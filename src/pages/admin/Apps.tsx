import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { CheckCircle2, Copy, Link2, Plus, Power, Trash2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

const providerLabels = {
  zendrop: "Zendrop",
  aliexpress: "AliExpress",
  cj_dropshipping: "CJ Dropshipping",
  dsers: "DSers",
  custom: "Custom",
} as const;

type DropshippingProvider = keyof typeof providerLabels;

function getProviderLabel(provider: string | null) {
  if (provider && provider in providerLabels) {
    return providerLabels[provider as DropshippingProvider];
  }

  return providerLabels.custom;
}

export default function AppsIntegrations() {
  const utils = trpc.useUtils();
  const { lang, isRTL } = useLanguage();
  const label = (en: string, ar: string) => (lang === "ar" ? ar : en);
  const { data: integrations = [], isLoading } = trpc.settings.listDropshippingIntegrations.useQuery();
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [form, setForm] = useState<{ name: string; provider: DropshippingProvider }>({
    name: "",
    provider: "zendrop",
  });

  const webhookUrl = useMemo(() => {
    if (typeof window === "undefined") return "/api/webhooks/dropship/product";
    return `${window.location.origin}/api/webhooks/dropship/product`;
  }, []);

  const createIntegration = trpc.settings.createDropshippingIntegration.useMutation({
    onSuccess: async (created) => {
      setNewApiKey(created.key);
      await utils.settings.listDropshippingIntegrations.invalidate();
      setForm({ name: "", provider: "zendrop" });
      toast.success(label(`Integration ${created.name} created`, `تم إنشاء تكامل ${created.name}`));
    },
    onError: (error) => toast.error(error.message || label("Could not create integration", "تعذر إنشاء التكامل")),
  });

  const toggleIntegration = trpc.settings.toggleDropshippingIntegration.useMutation({
    onSuccess: async () => {
      await utils.settings.listDropshippingIntegrations.invalidate();
      toast.success(label("Integration status updated", "تم تحديث حالة التكامل"));
    },
  });

  const deleteIntegration = trpc.settings.deleteDropshippingIntegration.useMutation({
    onSuccess: async () => {
      await utils.settings.listDropshippingIntegrations.invalidate();
      toast.success(label("Integration deleted", "تم حذف التكامل"));
    },
  });

  const copy = async (value: string, message: string) => {
    await navigator.clipboard.writeText(value);
    toast.success(message);
  };

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            {label("Apps", "التطبيقات")}
          </p>
          <h1 className="mt-2 text-3xl font-black">{label("Apps and Dropshipping", "التطبيقات والدروبشيبينج")}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {label(
              "Connect the store to platforms like Zendrop and AliExpress with a secure webhook and API key.",
              "اربط المتجر بمنصات مثل Zendrop وAliExpress عبر Webhook ومفتاح API آمن."
            )}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className={`${isRTL ? "ml-2" : "mr-2"} inline h-4 w-4`} />
          {label("Dropshipping webhook ready", "Webhook الدروبشيبينج جاهز")}
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">{label("Integration name", "اسم التكامل")}</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
              placeholder={label("Zendrop main account", "حساب Zendrop الرئيسي")}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">{label("Provider", "المنصة")}</span>
            <select
              value={form.provider}
              onChange={(e) => setForm({ ...form, provider: e.target.value as DropshippingProvider })}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
            >
              {Object.entries(providerLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => createIntegration.mutate(form)}
            disabled={!form.name.trim() || createIntegration.isPending}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 font-bold text-black transition hover:bg-[#F8D778] disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {label("Create integration", "إنشاء ربط")}
          </button>
        </div>
      </section>

      {newApiKey && (
        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-amber-200">{label("One-time API key", "مفتاح API يظهر مرة واحدة")}</h2>
              <p className="text-sm text-amber-100/80">
                {label(
                  "This key is shown once. Store it in the dropshipping platform, then it will only appear masked.",
                  "هذا المفتاح يظهر مرة واحدة فقط. احفظه داخل منصة الدروبشيبينج، وبعدها سيظهر مخفيًا."
                )}
              </p>
            </div>
            <button
              onClick={() => copy(`Authorization: Bearer ${newApiKey}`, label("Authorization header copied", "تم نسخ Authorization header"))}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/30 px-4 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-300/10"
            >
              <Copy className="h-4 w-4" />
              {label("Copy header", "نسخ الهيدر")}
            </button>
          </div>
          <div className="break-all rounded-xl border border-amber-300/20 bg-black/40 px-4 py-3 font-mono text-sm text-amber-100">
            {newApiKey}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold">{label("Webhook URL", "رابط Webhook")}</h2>
            <p className="text-sm text-slate-400">
              {label(
                "Add this URL to the dropshipping platform to send product updates.",
                "ضع هذا الرابط في منصة الدروبشيبينج لإرسال تحديثات المنتجات."
              )}
            </p>
          </div>
          <button
            onClick={() => copy(webhookUrl, label("Webhook URL copied", "تم نسخ رابط webhook"))}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/5"
          >
            <Copy className="h-4 w-4" />
            {label("Copy URL", "نسخ الرابط")}
          </button>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-[#D4AF37]">
          {webhookUrl}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold">{label("Active integrations", "التكاملات النشطة")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-sm ${isRTL ? "text-right" : "text-left"}`}>
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">{label("Name", "الاسم")}</th>
                <th className="px-6 py-4 font-semibold">{label("Provider", "المنصة")}</th>
                <th className="px-6 py-4 font-semibold">{label("API Key", "مفتاح API")}</th>
                <th className="px-6 py-4 font-semibold">{label("Status", "الحالة")}</th>
                <th className={`px-6 py-4 font-semibold ${isRTL ? "text-left" : "text-right"}`}>{label("Actions", "الإجراءات")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    {label("Loading integrations...", "جار تحميل التكاملات...")}
                  </td>
                </tr>
              )}

              {!isLoading && integrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    {label("No integrations yet.", "لا توجد تكاملات بعد.")}
                  </td>
                </tr>
              )}

              {integrations.map((integration) => (
                <tr key={integration.id} className="transition hover:bg-white/5">
                  <td className="px-6 py-4 font-semibold">{integration.name}</td>
                  <td className="px-6 py-4">{getProviderLabel(integration.provider)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-[#D4AF37]">
                      {integration.key}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        integration.isActive
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-slate-500/15 text-slate-300"
                      }`}
                    >
                      {integration.isActive ? label("Active", "نشط") : label("Disabled", "متوقف")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex gap-2 ${isRTL ? "justify-start" : "justify-end"}`}>
                      <button
                        onClick={() =>
                          toggleIntegration.mutate({ id: integration.id, isActive: !integration.isActive })
                        }
                        className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5"
                        title={integration.isActive ? label("Disable", "إيقاف") : label("Enable", "تفعيل")}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        disabled
                        className="rounded-lg border border-white/10 p-2 text-slate-500"
                        title={label("Full key is shown once when created", "المفتاح الكامل يظهر مرة واحدة عند الإنشاء")}
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteIntegration.mutate({ id: integration.id })}
                        className="rounded-lg border border-red-500/20 p-2 text-red-300 transition hover:bg-red-500/10"
                        title={label("Delete", "حذف")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
