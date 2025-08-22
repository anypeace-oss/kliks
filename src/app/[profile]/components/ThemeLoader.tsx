"use client";

import { useEffect } from "react";

interface ThemeLoaderProps {
  schemeVariant: "theme1" | "theme2";
}

export function ThemeLoader({ schemeVariant }: ThemeLoaderProps) {
  useEffect(() => {
    // Remove existing theme stylesheet if any
    const existingTheme = document.getElementById("profile-theme");
    if (existingTheme) {
      existingTheme.remove();
    }

    // Create and append new theme stylesheet
    const link = document.createElement("link");
    link.id = "profile-theme";
    link.rel = "stylesheet";
    link.href = `/themes/${schemeVariant}.css`;
    document.head.appendChild(link);

    // Cleanup on unmount
    return () => {
      const themeElement = document.getElementById("profile-theme");
      if (themeElement) {
        themeElement.remove();
      }
    };
  }, [schemeVariant]);

  return null;
}