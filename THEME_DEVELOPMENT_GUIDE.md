# Adding New Themes - Developer Guide

This guide explains how to easily add new themes to the system. The theme management system is designed to be developer-friendly and requires minimal configuration.

## 🎨 How to Add a New Theme

Adding a new theme is a simple 3-step process:

### Step 1: Create the CSS File

1. Create a new CSS file in `/public/themes/` (e.g., `theme4.css`)
2. Define your theme using CSS custom properties (CSS variables)
3. Include both light and dark variants if needed

**Example CSS structure:**

```css
:root {
  --background: #ffffff;
  --foreground: #000000;
  --primary: #3b82f6;
  --primary-foreground: #ffffff;
  /* ... other CSS variables */
}

.dark {
  --background: #000000;
  --foreground: #ffffff;
  /* ... dark mode variants */
}

@theme inline {
  /* Map variables for compatibility */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... etc */
}
```

### Step 2: Add Theme Configuration

Add your theme configuration to the `AVAILABLE_THEMES` array in `/src/app/[profile]/components/ThemeLoader.tsx`:

```typescript
export const AVAILABLE_THEMES: ThemeConfig[] = [
  // ... existing themes
  {
    id: "theme4", // Unique identifier
    name: "Your Theme Name", // Display name
    description: "Theme description", // Brief description
    cssFile: "theme4.css", // CSS filename
    colors: {
      // Preview colors
      primary: "#3b82f6",
      background: "#ffffff",
      accent: "#f3f4f6",
    },
  },
];
```

### Step 3: Update Validation (Optional)

Update the theme validation in `/src/lib/validation/link-in-bio.ts`:

```typescript
function getAvailableThemeIds(): [string, ...string[]] {
  const availableThemes = ["theme1", "theme2", "theme3", "theme4"]; // Add your theme ID
  return availableThemes as [string, ...string[]];
}
```

## 🔧 System Architecture

### ThemeLoader Component

- **Location**: `/src/app/[profile]/components/ThemeLoader.tsx`
- **Purpose**: Manages theme loading and configuration
- **Key Features**:
  - Automatic theme validation
  - Error handling for missing themes
  - Support for preview mode
  - Easy theme configuration

### ThemeSelector Component

- **Location**: `/src/app/studio/microsite/components/ThemeSelector.tsx`
- **Purpose**: UI for selecting themes
- **Features**:
  - Automatically displays all available themes
  - Dynamic preview generation
  - Responsive grid layout

### PreviewWithTheme Component

- **Location**: `/src/app/studio/microsite/components/PreviewWithTheme.tsx`
- **Purpose**: Real-time theme preview
- **Features**:
  - Uses actual CSS files for preview
  - Iframe-based isolated rendering
  - Real-time theme switching

## 🎯 CSS Variable Guidelines

When creating themes, use these CSS variables for consistency:

### Core Colors

```css
--background          /* Main background */
--foreground          /* Main text color */
--primary             /* Primary brand color */
--primary-foreground  /* Text on primary color */
--secondary           /* Secondary color */
--muted               /* Muted text/elements */
--accent             /* Accent color */
--border             /* Border color */
```

### Typography

```css
--font-sans          /* Sans-serif font */
--font-serif         /* Serif font */
--font-mono          /* Monospace font */
```

### Layout

```css
--radius             /* Border radius */
--spacing            /* Base spacing unit */
```

### Shadows

```css
--shadow-sm          /* Small shadow */
--shadow             /* Default shadow */
--shadow-lg          /* Large shadow */
```

## 🚀 Examples

### Example 1: Minimal Theme Addition

```typescript
// In ThemeLoader.tsx
{
  id: "minimal-blue",
  name: "Minimal Blue",
  description: "Clean blue theme",
  cssFile: "minimal-blue.css",
  colors: {
    primary: "#2563eb",
    background: "#ffffff",
    accent: "#dbeafe",
  },
}
```

### Example 2: Dark Theme Addition

```typescript
// In ThemeLoader.tsx
{
  id: "dark-purple",
  name: "Dark Purple",
  description: "Dark theme with purple accents",
  cssFile: "dark-purple.css",
  colors: {
    primary: "#8b5cf6",
    background: "#1f1f1f",
    accent: "#2d1b69",
  },
}
```

## ✨ Best Practices

1. **Naming**: Use descriptive, kebab-case IDs (`modern-dark`, `neon-green`)
2. **Colors**: Ensure good contrast ratios for accessibility
3. **Testing**: Test themes in both layout variants (`default` and `store`)
4. **Documentation**: Add clear descriptions for theme purposes
5. **Fallbacks**: Always provide fallback colors in case CSS fails to load

## 🔄 How It Works

1. **Configuration**: Themes are configured in the `AVAILABLE_THEMES` array
2. **Validation**: The system validates theme IDs against available themes
3. **Loading**: CSS files are dynamically loaded when themes are selected
4. **Preview**: Real-time preview uses iframe with injected CSS
5. **Persistence**: Theme selection is saved to the database

## 📁 File Structure

```
├── public/themes/
│   ├── theme1.css          # Minimal theme
│   ├── theme2.css          # Modern theme
│   ├── theme3.css          # Neon dark theme
│   └── your-theme.css      # Your new theme
├── src/app/[profile]/components/
│   └── ThemeLoader.tsx     # Theme management
├── src/app/studio/microsite/components/
│   ├── ThemeSelector.tsx   # Theme selection UI
│   └── PreviewWithTheme.tsx # Theme preview
└── src/lib/validation/
    └── link-in-bio.ts      # Theme validation
```

## 🎨 Theme Ideas

Here are some theme ideas to inspire you:

- **Retro 80s**: Neon colors, synthwave aesthetic
- **Minimalist**: Clean whites and grays
- **Corporate**: Professional blues and grays
- **Nature**: Greens and earth tones
- **Sunset**: Warm oranges and pinks
- **Monochrome**: Black and white only
- **Cyberpunk**: Dark with neon accents
- **Pastel**: Soft, muted colors

The system is designed to be flexible and extensible. Happy theming! 🎨
