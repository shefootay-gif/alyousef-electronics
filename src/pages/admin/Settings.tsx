import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useTheme } from "@/providers/ThemeProvider";
import { toast } from "sonner";
import { Globe2, Palette, Save, Share2, Store, Wand2 } from "lucide-react";

type SettingsForm = {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  currency: "EGP";
  themePreset: "luxury" | "clean" | "contrast";
  heroStyle: "image" | "minimal" | "spotlight";
  contactLinks: {
    whatsapp: string;
    website: string;
    snapchat: string;
    twitter: string;
    telegram: string;
  };
  trackingPixels: {
    facebookPixelId: string;
    tiktokPixelId: string;
    snapchatPixelId: string;
    googleAnalyticsId: string;
  };
};

const defaultForm: SettingsForm = {
  siteName: "AL-YOUSEF Electronics",
  primaryColor: "#D4AF37",
  secondaryColor: "#0F172A",
  accentColor: "#0099CC",
  currency: "EGP",
  themePreset: "luxury",
  heroStyle: "image",
  contactLinks: {
    whatsapp: "",
    website: "",
    snapchat: "",
    twitter: "",
    telegram: "",
  },
  trackingPixels: {
    facebookPixelId: "",
    tiktokPixelId: "",
    snapchatPixelId: "",
    googleAnalyticsId: "",
  },
};

export default function Settings() {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();
  const { siteName } = useTheme();
  const [form, setForm] = useState<SettingsForm>(defaultForm);

  useEffect(() => {
    if (!settings) return;

    setForm({
      siteName: settings.siteName ?? defaultForm.siteName,
      primaryColor: settings.primaryColor ?? defaultForm.primaryColor,
      secondaryColor: settings.secondaryColor ?? defaultForm.secondaryColor,
      accentColor: settings.accentColor ?? defaultForm.accentColor,
      currency: "EGP",
      themePreset: settings.themePreset ?? defaultForm.themePreset,
      heroStyle: settings.heroStyle ?? defaultForm.heroStyle,
      contactLinks: {
        ...defaultForm.contactLinks,
        ...(settings.contactLinks ?? {}),
      },
      trackingPixels: {
        ...defaultForm.trackingPixels,
        ...(settings.trackingPixels ?? {}),
      },
    });
  }, [settings]);

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: async () => {
      await utils.settings.get.invalidate();
      await utils.settings.getContactLinks.invalidate();
      toast.success("تم حفظ إعدادات المتجر");
    },
    onError: (error) => toast.error(error.message || "تعذر حفظ الإعدادات"),
  });

  const save = () => {
    updateSettings.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6 text-slate-100">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">Store settings</p>
          <h1 className="mt-2 text-3xl font-black">إعدادات المتجر</h1>
          <p className="mt-2 text-sm text-slate-400">
            تحكم في الاسم، العملة، شكل الثيم، روابط التواصل، وأكواد التتبع.
          </p>
        </div>
        <button
          onClick={save}
          disabled={updateSettings.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 font-bold text-black transition hover:bg-[#F8D778] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {updateSettings.isPending ? "جار الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Store className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl font-bold">هوية المتجر</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-300">اسم الموقع</span>
              <input
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
                placeholder="AL-YOUSEF Electronics"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">العملة</span>
              <select
                value={form.currency}
                onChange={() => setForm({ ...form, currency: "EGP" })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
              >
                <option value="EGP">الجنيه المصري EGP</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">شكل الهيرو</span>
              <select
                value={form.heroStyle}
                onChange={(e) => setForm({ ...form, heroStyle: e.target.value as SettingsForm["heroStyle"] })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
              >
                <option value="image">صورة كاملة</option>
                <option value="spotlight">إضاءة منتج</option>
                <option value="minimal">نظيف وبسيط</option>
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Wand2 className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl font-bold">معاينة مباشرة</h2>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{
              background: `linear-gradient(135deg, ${form.secondaryColor}, #050505)`,
              borderColor: `${form.primaryColor}66`,
            }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-black"
                style={{ backgroundColor: form.primaryColor }}
              >
                {form.siteName.charAt(0)}
              </div>
              <div>
                <p className="font-black">{form.siteName || siteName}</p>
                <p className="text-xs text-slate-300">EGP store</p>
              </div>
            </div>
            <button
              className="rounded-xl px-4 py-2 text-sm font-bold text-black"
              style={{ backgroundColor: form.primaryColor }}
            >
              زر الشراء
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Palette className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">تعديل شكل الموضوع</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["primaryColor", "اللون الأساسي"],
            ["secondaryColor", "لون الخلفية"],
            ["accentColor", "لون مساعد"],
          ].map(([key, label]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">{label}</span>
              <div className="flex overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <input
                  type="color"
                  value={form[key as "primaryColor" | "secondaryColor" | "accentColor"]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="h-12 w-14 border-0 bg-transparent p-1"
                />
                <input
                  value={form[key as "primaryColor" | "secondaryColor" | "accentColor"]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="min-w-0 flex-1 bg-transparent px-3 outline-none"
                />
              </div>
            </label>
          ))}

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">قالب الثيم</span>
            <select
              value={form.themePreset}
              onChange={(e) => setForm({ ...form, themePreset: e.target.value as SettingsForm["themePreset"] })}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
            >
              <option value="luxury">Luxury</option>
              <option value="clean">Clean</option>
              <option value="contrast">High contrast</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Share2 className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">روابط التواصل</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.keys(defaultForm.contactLinks).map((key) => (
            <label key={key} className="space-y-2">
              <span className="text-sm font-semibold capitalize text-slate-300">{key}</span>
              <input
                value={form.contactLinks[key as keyof SettingsForm["contactLinks"]]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contactLinks: { ...form.contactLinks, [key]: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">أكواد التتبع والتسويق</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.keys(defaultForm.trackingPixels).map((key) => (
            <label key={key} className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">{key}</span>
              <input
                value={form.trackingPixels[key as keyof SettingsForm["trackingPixels"]]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    trackingPixels: { ...form.trackingPixels, [key]: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
              />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
