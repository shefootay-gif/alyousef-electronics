export type LocalizedText = {
  en: string;
  ar: string;
};

export type ServiceItem = {
  title: LocalizedText;
  description: LocalizedText;
};

export type ContactLinks = {
  whatsapp?: string;
  website?: string;
  snapchat?: string;
  twitter?: string;
  telegram?: string;
};

export type TrackingPixels = {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  snapchatPixelId?: string;
  googleAnalyticsId?: string;
};

export type SiteContent = {
  tagline: string;
  logoTagline: string;
  bannerText: LocalizedText;
  heroEyebrow: LocalizedText;
  heroTitle: LocalizedText;
  heroDescription: LocalizedText;
  heroImage: string;
  offerTitle: LocalizedText;
  offerCode: string;
  footerDescription: LocalizedText;
  supportEmail: string;
  aboutTitle: LocalizedText;
  aboutDescription: LocalizedText;
  aboutImage: string;
  services: ServiceItem[];
};

export type SiteSettings = {
  siteName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  currency: "EGP";
  themePreset: "luxury" | "clean" | "contrast";
  heroStyle: "image" | "minimal" | "spotlight";
  contactLinks: ContactLinks;
  trackingPixels: TrackingPixels;
  content: SiteContent;
};

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? DeepPartial<U>[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export const defaultSiteSettings: SiteSettings = {
  siteName: "AL-YOUSEF Electronics",
  logoUrl: "",
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
  content: {
    tagline: "Store",
    logoTagline: "PREMIUM TECH STORE",
    bannerText: {
      en: "Special Offer: Free shipping on all orders over EGP 5000!",
      ar: "عرض خاص: شحن مجاني لكل الطلبات فوق 5000 جنيه!",
    },
    heroEyebrow: {
      en: "Premium Electronics",
      ar: "إلكترونيات فاخرة",
    },
    heroTitle: {
      en: "Experience Technology Redefined",
      ar: "اكتشف التكنولوجيا بمفهوم جديد",
    },
    heroDescription: {
      en: "Discover the latest smart devices and accessories in one premium electronics store.",
      ar: "نقدم لك أحدث الأجهزة الذكية وملحقاتها في مكان واحد بتجربة شراء فاخرة.",
    },
    heroImage: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=800&auto=format&fit=crop",
    offerTitle: {
      en: "Limited Time Gaming Offer",
      ar: "عرض ألعاب لفترة محدودة",
    },
    offerCode: "GAMING15",
    footerDescription: {
      en: "A premium electronics destination for smartphones, laptops, accessories, gaming, and smart devices with a refined gold and navy identity.",
      ar: "متجر إلكترونيات فاخر يجمع بين الهواتف، الحواسيب، الملحقات، الألعاب والأجهزة الذكية بهوية ذهبية وكحلية واضحة.",
    },
    supportEmail: "support@alyousef.com",
    aboutTitle: {
      en: "Vision for the Future",
      ar: "رؤية نحو المستقبل",
    },
    aboutDescription: {
      en: "AL-YOUSEF Electronics was founded with a clear vision: to provide the best and latest technology to our customers in Egypt. We pride ourselves on being the trusted destination for smart devices.",
      ar: "تأسست شركة اليوسف للإلكترونيات برؤية واضحة: تقديم أفضل وأحدث التقنيات لعملائنا. نحن نفخر بكوننا الوجهة الموثوقة لكل ما يخص الأجهزة الذكية.",
    },
    aboutImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop",
    services: [
      {
        title: { en: "Free Delivery", ar: "توصيل مجاني" },
        description: { en: "On eligible orders", ar: "على الطلبات المؤهلة" },
      },
      {
        title: { en: "Secure Payment", ar: "دفع آمن" },
        description: { en: "Protected checkout", ar: "دفع محمي" },
      },
      {
        title: { en: "Support", ar: "دعم فني" },
        description: { en: "We are here to help", ar: "نحن هنا لمساعدتك" },
      },
      {
        title: { en: "Easy Returns", ar: "إرجاع سهل" },
        description: { en: "Simple return process", ar: "إجراءات إرجاع سهلة" },
      },
    ],
  },
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function mergeSiteSettings(settings: DeepPartial<SiteSettings> = {}): SiteSettings {
  return {
    ...defaultSiteSettings,
    ...settings,
    contactLinks: {
      ...defaultSiteSettings.contactLinks,
      ...(settings.contactLinks ?? {}),
    },
    trackingPixels: {
      ...defaultSiteSettings.trackingPixels,
      ...(settings.trackingPixels ?? {}),
    },
    content: {
      ...defaultSiteSettings.content,
      ...(settings.content ?? {}),
      bannerText: {
        ...defaultSiteSettings.content.bannerText,
        ...(settings.content?.bannerText ?? {}),
      },
      heroEyebrow: {
        ...defaultSiteSettings.content.heroEyebrow,
        ...(settings.content?.heroEyebrow ?? {}),
      },
      heroTitle: {
        ...defaultSiteSettings.content.heroTitle,
        ...(settings.content?.heroTitle ?? {}),
      },
      heroDescription: {
        ...defaultSiteSettings.content.heroDescription,
        ...(settings.content?.heroDescription ?? {}),
      },
      offerTitle: {
        ...defaultSiteSettings.content.offerTitle,
        ...(settings.content?.offerTitle ?? {}),
      },
      footerDescription: {
        ...defaultSiteSettings.content.footerDescription,
        ...(settings.content?.footerDescription ?? {}),
      },
      aboutTitle: {
        ...defaultSiteSettings.content.aboutTitle,
        ...(settings.content?.aboutTitle ?? {}),
      },
      aboutDescription: {
        ...defaultSiteSettings.content.aboutDescription,
        ...(settings.content?.aboutDescription ?? {}),
      },
      services: settings.content?.services?.length
        ? settings.content.services.map((service, index) => {
            const fallback = defaultSiteSettings.content.services[index] ?? defaultSiteSettings.content.services[0];
            return {
              title: {
                ...fallback.title,
                ...(service.title ?? {}),
              },
              description: {
                ...fallback.description,
                ...(service.description ?? {}),
              },
            };
          })
        : defaultSiteSettings.content.services,
    },
  };
}

export function pickLocalized(text: LocalizedText, lang: string) {
  return lang === "ar" ? text.ar : text.en;
}

export function pruneEmptyStrings<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => pruneEmptyStrings(item)) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, item]) => [key, pruneEmptyStrings(item)])
        .filter(([, item]) => item !== undefined),
    ) as T;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined as T;
  }

  return value;
}
