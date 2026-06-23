import React, { createContext, useContext, useEffect, useState } from "react";
import { trpc } from "./trpc";

interface ThemeContextType {
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  siteName: "AL-YOUSEF Electronics",
  primaryColor: "#D4AF37",
  secondaryColor: "#0F172A",
  isLoading: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const [theme, setTheme] = useState({
    siteName: "AL-YOUSEF Electronics",
    primaryColor: "#D4AF37",
    secondaryColor: "#0F172A",
  });

  useEffect(() => {
    if (settings) {
      setTheme({
        siteName: settings.siteName || "AL-YOUSEF Electronics",
        primaryColor: settings.primaryColor || "#D4AF37",
        secondaryColor: settings.secondaryColor || "#0F172A",
      });

      // Inject custom CSS variables to root
      const root = document.documentElement;
      root.style.setProperty("--primary", settings.primaryColor || "#D4AF37");
      root.style.setProperty("--secondary", settings.secondaryColor || "#0F172A");
      
      // Update document title
      document.title = settings.siteName || "AL-YOUSEF Electronics";
    }
  }, [settings]);

  return (
    <ThemeContext.Provider value={{ ...theme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
