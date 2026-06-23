import { useEffect, useState } from "react";
import { trpc } from "@/providers/trpc";
import { useTheme } from "@/providers/ThemeProvider";
import { toast } from "sonner";
import { defaultSiteSettings, mergeSiteSettings, type SiteSettings } from "@contracts/site-settings";
import { Globe2, Image, Palette, Save, Share2, Store, Type, Wand2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

type LocalizedKey =
  | "bannerText"
  | "heroEyebrow"
  | "heroTitle"
  | "heroDescription"
  | "offerTitle"
  | "footerDescription"
  | "aboutTitle"
  | "aboutDescription";

const localizedContentFields: { key: LocalizedKey; label: string; rows?: number }[] = [
  { key: "bannerText", label: "Top banner text" },
  { key: "heroEyebrow", label: "Hero eyebrow" },
  { key: "heroTitle", label: "Hero title" },
  { key: "heroDescription", label: "Hero description", rows: 3 },
  { key: "offerTitle", label: "Offer title" },
  { key: "footerDescription", label: "Footer description", rows: 3 },
  { key: "aboutTitle", label: "About title" },
  { key: "aboutDescription", label: "About description", rows: 4 },
];

const contactLabels: Record<keyof SiteSettings["contactLinks"], string> = {
  whatsapp: "WhatsApp phone",
  website: "Website URL",
  snapchat: "Snapchat URL or handle",
  twitter: "X / Twitter URL or handle",
  telegram: "Telegram URL or handle",
};

const trackingLabels: Record<keyof SiteSettings["trackingPixels"], string> = {
  facebookPixelId: "Facebook Pixel ID",
  tiktokPixelId: "TikTok Pixel ID",
  snapchatPixelId: "Snapchat Pixel ID",
  googleAnalyticsId: "Google Analytics ID",
};

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
        placeholder={placeholder}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
      />
    </label>
  );
}

export default function Settings() {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();
  const liveTheme = useTheme();
  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    if (settings) {
      setForm(mergeSiteSettings(settings));
    }
  }, [settings]);

  const updateSettings = trpc.settings.update.useMutation({
    onSuccess: async () => {
      await utils.settings.get.invalidate();
      await utils.settings.getContactLinks.invalidate();
      toast.success("Settings saved successfully");
    },
    onError: (error) => toast.error(error.message || "Could not save settings"),
  });

  const save = () => updateSettings.mutate(form);

  const updateContent = <K extends keyof SiteSettings["content"]>(key: K, value: SiteSettings["content"][K]) => {
    setForm((current) => ({
      ...current,
      content: {
        ...current.content,
        [key]: value,
      },
    }));
  };

  const updateLocalizedContent = (key: LocalizedKey, lang: "en" | "ar", value: string) => {
    updateContent(key, {
      ...form.content[key],
      [lang]: value,
    });
  };

  const setImageFromFile = (file: File | undefined, key: "logoUrl" | "heroImage" | "aboutImage") => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      if (key === "logoUrl") {
        setForm((current) => ({ ...current, logoUrl: value }));
      } else {
        updateContent(key, value);
      }
    };
    reader.readAsDataURL(file);
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
          <h1 className="mt-2 text-3xl font-black">Control site content</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage branding, logo, contact links, colors, banners, static copy, services, footer, and tracking codes.
          </p>
        </div>
        <button
          onClick={save}
          disabled={updateSettings.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 font-bold text-black transition hover:bg-[#F8D778] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {updateSettings.isPending ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Store className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl font-bold">Brand identity</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Site name"
              value={form.siteName}
              onChange={(siteName) => setForm({ ...form, siteName })}
              placeholder="AL-YOUSEF Electronics"
            />
            <TextInput
              label="Logo small tagline"
              value={form.content.tagline}
              onChange={(value) => updateContent("tagline", value)}
              placeholder="Store"
            />
            <TextInput
              label="Logo footer tagline"
              value={form.content.logoTagline}
              onChange={(value) => updateContent("logoTagline", value)}
              placeholder="PREMIUM TECH STORE"
            />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">Currency</span>
              <select
                value={form.currency}
                onChange={() => setForm({ ...form, currency: "EGP" })}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
              >
                <option value="EGP">Egyptian pound EGP</option>
              </select>
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_220px]">
            <TextInput
              label="Logo URL or data image"
              value={form.logoUrl}
              onChange={(logoUrl) => setForm({ ...form, logoUrl })}
              placeholder="/logo.png or https://..."
            />
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-300">Upload logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImageFromFile(event.target.files?.[0], "logoUrl")}
                className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4AF37] file:px-3 file:py-2 file:font-bold file:text-black"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
          <div className="mb-6 flex items-center gap-3">
            <Wand2 className="h-5 w-5 text-[#D4AF37]" />
            <h2 className="text-xl font-bold">Live preview</h2>
          </div>
          <div
            className="rounded-2xl border p-6"
            style={{
              background: `linear-gradient(135deg, ${form.secondaryColor}, #050505)`,
              borderColor: `${form.primaryColor}66`,
            }}
          >
            <div className="mb-6">
              <BrandLogo />
            </div>
            {form.logoUrl && (
              <img src={form.logoUrl} alt="Logo preview" className="mb-6 h-24 max-w-full rounded-xl object-contain" />
            )}
            <p className="font-black">{form.siteName || liveTheme.siteName}</p>
            <p className="mt-1 text-xs text-slate-300">{form.content.tagline}</p>
            <button className="mt-5 rounded-xl px-4 py-2 text-sm font-bold text-black" style={{ backgroundColor: form.primaryColor }}>
              Buy button
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Palette className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">Brand colors and theme</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["primaryColor", "Primary color"],
            ["secondaryColor", "Background color"],
            ["accentColor", "Accent color"],
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
            <span className="text-sm font-semibold text-slate-300">Theme preset</span>
            <select
              value={form.themePreset}
              onChange={(e) => setForm({ ...form, themePreset: e.target.value as SiteSettings["themePreset"] })}
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
          <Image className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">Images and banners</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">Hero style</span>
            <select
              value={form.heroStyle}
              onChange={(e) => setForm({ ...form, heroStyle: e.target.value as SiteSettings["heroStyle"] })}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none transition focus:border-[#D4AF37]"
            >
              <option value="image">Full image</option>
              <option value="spotlight">Product spotlight</option>
              <option value="minimal">Minimal</option>
            </select>
          </label>
          <TextInput label="Hero image URL" value={form.content.heroImage} onChange={(value) => updateContent("heroImage", value)} />
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">Upload hero image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFromFile(event.target.files?.[0], "heroImage")}
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4AF37] file:px-3 file:py-2 file:font-bold file:text-black"
            />
          </label>
          <TextInput label="About image URL" value={form.content.aboutImage} onChange={(value) => updateContent("aboutImage", value)} />
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-300">Upload about image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFromFile(event.target.files?.[0], "aboutImage")}
              className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4AF37] file:px-3 file:py-2 file:font-bold file:text-black"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Type className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">Static text content</h2>
        </div>
        <div className="space-y-5">
          {localizedContentFields.map((field) => (
            <div key={field.key} className="grid gap-4 md:grid-cols-2">
              <TextArea
                label={`${field.label} - English`}
                value={form.content[field.key].en}
                rows={field.rows}
                onChange={(value) => updateLocalizedContent(field.key, "en", value)}
              />
              <TextArea
                label={`${field.label} - Arabic`}
                value={form.content[field.key].ar}
                rows={field.rows}
                onChange={(value) => updateLocalizedContent(field.key, "ar", value)}
              />
            </div>
          ))}
          <TextInput label="Offer code" value={form.content.offerCode} onChange={(value) => updateContent("offerCode", value)} />
          <TextInput label="Support email" value={form.content.supportEmail} onChange={(value) => updateContent("supportEmail", value)} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Share2 className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">Contact and social links</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(defaultSiteSettings.contactLinks) as (keyof SiteSettings["contactLinks"])[]).map((key) => (
            <TextInput
              key={key}
              label={contactLabels[key]}
              value={form.contactLinks[key] ?? ""}
              onChange={(value) =>
                setForm({
                  ...form,
                  contactLinks: { ...form.contactLinks, [key]: value },
                })
              }
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Wand2 className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">Services strip</h2>
        </div>
        <div className="space-y-4">
          {form.content.services.map((service, index) => (
            <div key={index} className="grid gap-4 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-2">
              <TextInput
                label={`Service ${index + 1} title - English`}
                value={service.title.en}
                onChange={(value) => {
                  const services = [...form.content.services];
                  services[index] = { ...service, title: { ...service.title, en: value } };
                  updateContent("services", services);
                }}
              />
              <TextInput
                label={`Service ${index + 1} title - Arabic`}
                value={service.title.ar}
                onChange={(value) => {
                  const services = [...form.content.services];
                  services[index] = { ...service, title: { ...service.title, ar: value } };
                  updateContent("services", services);
                }}
              />
              <TextInput
                label={`Service ${index + 1} description - English`}
                value={service.description.en}
                onChange={(value) => {
                  const services = [...form.content.services];
                  services[index] = { ...service, description: { ...service.description, en: value } };
                  updateContent("services", services);
                }}
              />
              <TextInput
                label={`Service ${index + 1} description - Arabic`}
                value={service.description.ar}
                onChange={(value) => {
                  const services = [...form.content.services];
                  services[index] = { ...service, description: { ...service.description, ar: value } };
                  updateContent("services", services);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0F172A]/80 p-6">
        <div className="mb-6 flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-[#D4AF37]" />
          <h2 className="text-xl font-bold">Tracking and marketing pixels</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(defaultSiteSettings.trackingPixels) as (keyof SiteSettings["trackingPixels"])[]).map((key) => (
            <TextInput
              key={key}
              label={trackingLabels[key]}
              value={form.trackingPixels[key] ?? ""}
              onChange={(value) =>
                setForm({
                  ...form,
                  trackingPixels: { ...form.trackingPixels, [key]: value },
                })
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
