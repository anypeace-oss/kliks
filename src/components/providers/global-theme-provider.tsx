"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";

interface GlobalThemeContextType {
  applyTheme: (themeId: "theme1" | "theme2") => void;
  removeTheme: () => void;
}

const GlobalThemeContext = createContext<GlobalThemeContextType | undefined>(
  undefined
);

export function useGlobalTheme() {
  const context = useContext(GlobalThemeContext);
  if (context === undefined) {
    throw new Error("useGlobalTheme must be used within a GlobalThemeProvider");
  }
  return context;
}

interface GlobalThemeProviderProps {
  children: ReactNode;
}

export function GlobalThemeProvider({ children }: GlobalThemeProviderProps) {
  const applyTheme = (themeId: "theme1" | "theme2") => {
    // Remove existing theme stylesheet if any
    const existingTheme = document.getElementById("global-theme");
    if (existingTheme) {
      existingTheme.remove();
    }

    // Create and append new theme stylesheet
    const link = document.createElement("link");
    link.id = "global-theme";
    link.rel = "stylesheet";
    link.href = `/themes/${themeId}.css`;
    document.head.appendChild(link);
  };

  const removeTheme = () => {
    const themeElement = document.getElementById("global-theme");
    if (themeElement) {
      themeElement.remove();
    }
  };

  return (
    <GlobalThemeContext.Provider value={{ applyTheme, removeTheme }}>
      {children}
    </GlobalThemeContext.Provider>
  );
}
