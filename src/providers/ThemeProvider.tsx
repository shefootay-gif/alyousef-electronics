import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "./trpc";
import { defaultSiteSettings, mergeSiteSettings, type SiteSettings } from "@contracts/site-settings";

type ThemeContextType = SiteSettings & {
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  ...defaultSiteSettings,
  isLoading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const [theme, setTheme] = useState<SiteSettings>(defaultSiteSettings);

  useEffect(() => {
    if (settings) {
      const nextTheme = mergeSiteSettings(settings);
      setTheme(nextTheme);

      const root = document.documentElement;
      root.style.setProperty("--primary", nextTheme.primaryColor);
      root.style.setProperty("--secondary", nextTheme.secondaryColor);
      root.style.setProperty("--accent", nextTheme.accentColor);
      root.dataset.themePreset = nextTheme.themePreset;
      root.dataset.heroStyle = nextTheme.heroStyle;
      
      document.title = nextTheme.siteName;
    }
  }, [settings]);

  return (
    <ThemeContext.Provider value={{ ...theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
