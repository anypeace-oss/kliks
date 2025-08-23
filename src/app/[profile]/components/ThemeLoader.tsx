"use client";

import { useEffect } from "react";
import { AVAILABLE_THEMES, getThemeById, type ThemeConfig } from "../../../lib/theme-config";

// Re-export for backward compatibility
export { AVAILABLE_THEMES, getThemeById, getAvailableThemeIds, isValidTheme } from "../../../lib/theme-config";
export type { ThemeConfig } from "../../../lib/theme-config";

interface ThemeLoaderProps {
  schemeVariant: string;
  previewMode?: boolean; // For preview environments
}

export function ThemeLoader({
  schemeVariant,
  previewMode = false,
}: ThemeLoaderProps) {
  useEffect(() => {
    // Validate theme exists
    const themeConfig = getThemeById(schemeVariant);
    if (!themeConfig) {
      console.warn(
        `Theme '${schemeVariant}' not found. Falling back to theme1.`
      );
      return;
    }

    const themeId = previewMode ? `preview-theme` : "profile-theme";

    // Remove existing theme stylesheet if any
    const existingTheme = document.getElementById(themeId);
    if (existingTheme) {
      existingTheme.remove();
    }

    // Create and append new theme stylesheet
    const link = document.createElement("link");
    link.id = themeId;
    link.rel = "stylesheet";
    link.href = `/themes/${themeConfig.cssFile}`;

    // Add error handling for theme loading
    link.onerror = () => {
      console.error(`Failed to load theme: ${themeConfig.cssFile}`);
    };

    link.onload = () => {
      if (previewMode) {
        console.log(`Preview theme loaded: ${themeConfig.name}`);
      }
    };

    document.head.appendChild(link);

    // Cleanup on unmount
    return () => {
      const themeElement = document.getElementById(themeId);
      if (themeElement) {
        themeElement.remove();
      }
    };
  }, [schemeVariant, previewMode]);

  return null;
}
