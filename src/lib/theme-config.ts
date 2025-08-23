// Theme configuration - easy to extend for developers
// This file can be used by both server and client components

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  cssFile: string;
  colors: {
    primary: string;
    background: string;
    accent: string;
  };
}

// Available themes - add new themes here
export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: "theme1",
    name: "Minimal Theme",
    description: "Clean monospace design with subtle shadows",
    cssFile: "theme1.css",
    colors: {
      primary: "#000000",
      background: "#ffffff",
      accent: "#f5f5f5",
    },
  },
  {
    id: "theme2",
    name: "Modern Theme",
    description: "Contemporary design with vibrant colors",
    cssFile: "theme2.css",
    colors: {
      primary: "#6171f3",
      background: "#f8fafe",
      accent: "#e8f0fe",
    },
  },
  {
    id: "theme3",
    name: "Neon Dark Theme",
    description: "Dark theme with neon purple accents and modern styling",
    cssFile: "theme3.css",
    colors: {
      primary: "#d946ef",
      background: "#0f0f23",
      accent: "#1e1e3a",
    },
  },
  // 👆 Add new themes here! Just:
  // 1. Add your theme configuration above
  // 2. Place your CSS file in /public/themes/
  // 3. The system will automatically detect and use it!
];

// Helper functions for theme management
export const getThemeById = (id: string): ThemeConfig | undefined => {
  return AVAILABLE_THEMES.find((theme) => theme.id === id);
};

export const getAvailableThemeIds = (): string[] => {
  return AVAILABLE_THEMES.map((theme) => theme.id);
};

export const isValidTheme = (id: string): boolean => {
  return AVAILABLE_THEMES.some((theme) => theme.id === id);
};