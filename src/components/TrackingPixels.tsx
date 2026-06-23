import { useEffect } from "react";
import { trpc } from "@/providers/trpc";

export default function TrackingPixels() {
  const { data: settings } = trpc.settings.get.useQuery();

  useEffect(() => {
    if (!settings?.trackingPixels) return;
    const pixels = settings.trackingPixels;

    // Facebook Pixel
    if (pixels.facebookPixelId && !window.fbq) {
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):(n as any).queue.push(arguments)};
      if(!f._fbq)f._fbq=n;(n as any).push=n;(n as any).loaded=!0;(n as any).version='2.0';
      (n as any).queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      (window as any).fbq('init', pixels.facebookPixelId);
      (window as any).fbq('track', 'PageView');
    }

    // TikTok Pixel
    if (pixels.tiktokPixelId && !(window as any).ttq) {
      !function (w, d, t) {
        w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
        ttq.load(pixels.tiktokPixelId);
        ttq.page();
      }(window, document, 'ttq');
    }

    // Snapchat Pixel
    if (pixels.snapchatPixelId && !(window as any).snaptr) {
      (function(e,t,n){if((e as any).snaptr)return;var a=(e as any).snaptr=function()
      {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
      a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
      r.src=n;var u=t.getElementsByTagName(s)[0];
      u.parentNode.insertBefore(r,u);})(window,document,
      'https://sc-static.net/scevent.min.js');
      (window as any).snaptr('init', pixels.snapchatPixelId);
      (window as any).snaptr('track', 'PAGE_VIEW');
    }

    // Google Analytics
    if (pixels.googleAnalyticsId && !(window as any).gtag) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${pixels.googleAnalyticsId}`;
      script.async = true;
      document.head.appendChild(script);
      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function(...args: any[]){(window as any).dataLayer.push(arguments);}
      (window as any).gtag('js', new Date());
      (window as any).gtag('config', pixels.googleAnalyticsId);
    }
  }, [settings]);

  return null;
}
