import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { CheckCircle2, Copy, Link2, Plus, Power, Trash2 } from "lucide-react";

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
      toast.success(`تم إنشاء تكامل ${created.name}`);
    },
    onError: (error) => toast.error(error.message || "تعذر إنشاء التكامل"),
  });

  const toggleIntegration = trpc.settings.toggleDropshippingIntegration.useMutation({
    onSuccess: async () => {
      await utils.settings.listDropshippingIntegrations.invalidate();
      toast.success("تم تحديث حالة التكامل");
    },
  });

  const deleteIntegration = trpc.settings.deleteDropshippingIntegration.useMutation({
    onSuccess: async () => {
      await utils.settings.listDropshippingIntegrations.invalidate();
      toast.success("تم حذف التكامل");
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
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">Apps</p>
          <h1 className="mt-2 text-3xl font-black">التطبيقات والدروبشيبينج</h1>
          <p className="mt-2 text-sm text-slate-400">
            اربط المتجر بمنصات مثل Zendrop وAliExpress عبر Webhook ومفتاح API آمن.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="mr-2 inline h-4 w-4" />
          Dropshipping webhook جاهز
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">اسم التكامل</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
              placeholder="Zendrop main account"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">المنصة</span>
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
            إنشاء ربط
          </button>
        </div>
      </section>

      {newApiKey && (
        <section className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
          <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-amber-200">One-time API key</h2>
              <p className="text-sm text-amber-100/80">
                This key is shown once. Store it in the dropshipping platform, then it will only appear masked.
              </p>
            </div>
            <button
              onClick={() => copy(`Authorization: Bearer ${newApiKey}`, "تم نسخ Authorization header")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/30 px-4 py-2 text-sm font-bold text-amber-100 transition hover:bg-amber-300/10"
            >
              <Copy className="h-4 w-4" />
              Copy header
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
            <h2 className="text-xl font-bold">Webhook URL</h2>
            <p className="text-sm text-slate-400">ضع هذا الرابط في منصة الدروبشيبينج لإرسال تحديثات المنتجات.</p>
          </div>
          <button
            onClick={() => copy(webhookUrl, "تم نسخ رابط webhook")}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/5"
          >
            <Copy className="h-4 w-4" />
            نسخ الرابط
          </button>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-[#D4AF37]">
          {webhookUrl}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]/80">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-xl font-bold">التكاملات النشطة</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Provider</th>
                <th className="px-6 py-4 font-semibold">API Key</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Loading integrations...
                  </td>
                </tr>
              )}

              {!isLoading && integrations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    لا توجد تكاملات بعد.
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
                      {integration.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          toggleIntegration.mutate({ id: integration.id, isActive: !integration.isActive })
                        }
                        className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:bg-white/5"
                        title={integration.isActive ? "Disable" : "Enable"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        disabled
                        className="rounded-lg border border-white/10 p-2 text-slate-500"
                        title="Full key is shown once when created"
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteIntegration.mutate({ id: integration.id })}
                        className="rounded-lg border border-red-500/20 p-2 text-red-300 transition hover:bg-red-500/10"
                        title="Delete"
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
