"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Wait until after client-side hydration to show the theme provider
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return children without theme provider during SSR to avoid hydration mismatch
    return <>{children}</>;
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
