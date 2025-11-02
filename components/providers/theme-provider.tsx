"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      {...props}
    >
      <ThemeManager />
      {children}
    </NextThemesProvider>
  );
}

function ThemeManager() {
  const { theme } = useNextTheme();
  
  React.useEffect(() => {
    const root = document.documentElement;
    const darkThemes = ["dark", "blue-dark", "green-dark", "purple-dark", "orange-dark"];
    const isDark = theme && darkThemes.includes(theme);
    
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return null;
}

