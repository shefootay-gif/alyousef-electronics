import { useEffect } from "react";
import { trpc } from "@/providers/trpc";

type TrackingPixelsConfig = {
  facebookPixelId?: string;
  tiktokPixelId?: string;
  snapchatPixelId?: string;
  googleAnalyticsId?: string;
};

type SettingsWithTracking = {
  trackingPixels?: TrackingPixelsConfig;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: {
      load: (id: string) => void;
      page: () => void;
    };
    snaptr?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function loadScript(id: string, src: string): void {
  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.src = src;
  script.async = true;
  document.head.appendChild(script);
}

export default function TrackingPixels() {
  const { data } = trpc.settings.get.useQuery();
  const settings = data as SettingsWithTracking | undefined;

  useEffect(() => {
    const pixels = settings?.trackingPixels;
    if (!pixels) return;

    if (pixels.facebookPixelId) {
      loadScript("facebook-pixel", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq ??= (...args: unknown[]) => {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push(["fbq", ...args]);
      };
      window.fbq("init", pixels.facebookPixelId);
      window.fbq("track", "PageView");
    }

    if (pixels.tiktokPixelId) {
      loadScript("tiktok-pixel", "https://analytics.tiktok.com/i18n/pixel/events.js");
      window.ttq ??= {
        load: () => undefined,
        page: () => undefined,
      };
      window.ttq.load(pixels.tiktokPixelId);
      window.ttq.page();
    }

    if (pixels.snapchatPixelId) {
      loadScript("snapchat-pixel", "https://sc-static.net/scevent.min.js");
      window.snaptr ??= (...args: unknown[]) => {
        window.dataLayer = window.dataLayer ?? [];
        window.dataLayer.push(["snaptr", ...args]);
      };
      window.snaptr("init", pixels.snapchatPixelId);
      window.snaptr("track", "PAGE_VIEW");
    }

    if (pixels.googleAnalyticsId) {
      loadScript(
        "google-analytics",
        `https://www.googletagmanager.com/gtag/js?id=${pixels.googleAnalyticsId}`,
      );
      window.dataLayer = window.dataLayer ?? [];
      window.gtag ??= (...args: unknown[]) => {
        window.dataLayer?.push(args);
      };
      window.gtag("js", new Date());
      window.gtag("config", pixels.googleAnalyticsId);
    }
  }, [settings]);

  return null;
}
