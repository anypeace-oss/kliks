"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import {
  AVAILABLE_THEMES,
  type ThemeConfig,
} from "../../../../lib/theme-config";

// Generate preview component for each theme
const generateThemePreview = (theme: ThemeConfig): React.ReactNode => {
  const { colors } = theme;

  // Create preview based on theme colors
  const isMinimal = theme.id === "theme1";
  const fontClass = isMinimal ? "font-mono" : "font-sans";
  const textColor = isMinimal ? "text-black" : "text-blue-600";

  return (
    <div
      className={`space-y-2 p-3 border rounded-md ${fontClass} ${textColor}`}
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-8 h-8 rounded-full mx-auto"
        style={{ backgroundColor: colors.primary }}
      />
      <div className="space-y-1">
        <div
          className="h-2 rounded w-3/4 mx-auto"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="h-2 rounded w-1/2 mx-auto"
          style={{ backgroundColor: colors.accent }}
        />
      </div>
      <div className="space-y-1">
        {isMinimal ? (
          <>
            <div className="h-6 bg-gray-100 border border-gray-200 rounded text-xs flex items-center justify-center">
              Link
            </div>
            <div className="h-6 bg-gray-100 border border-gray-200 rounded text-xs flex items-center justify-center">
              Link
            </div>
          </>
        ) : (
          <>
            <div
              className="h-6 text-white rounded text-xs flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              Link
            </div>
            <div
              className="h-6 text-white rounded text-xs flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              Link
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface ThemeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function ThemeSelector({ value, onValueChange }: ThemeSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Color Theme</CardTitle>
        <CardDescription>
          Select the visual style and color palette for your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AVAILABLE_THEMES.map((theme) => {
            const isSelected = value === theme.id;

            return (
              <Button
                key={theme.id}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start gap-3 relative ${
                  isSelected
                    ? "border-primary bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onValueChange(theme.id)}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}

                <div className="flex items-center gap-2 w-full">
                  <Palette className="w-5 h-5 text-primary" />
                  <span className="font-medium text-left">{theme.name}</span>
                </div>

                <p className="text-sm text-muted-foreground text-left break-words w-full whitespace-normal">
                  {theme.description}
                </p>

                <div className="flex gap-2 w-full">
                  <div
                    className="w-4 h-4 rounded-full border border-muted"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-muted"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-muted"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>

                <div className="w-full">{generateThemePreview(theme)}</div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
