"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Palette } from "lucide-react"

interface ThemeOption {
  id: "theme1" | "theme2"
  name: string
  description: string
  colors: {
    primary: string
    background: string
    accent: string
  }
  preview: React.ReactNode
}

const themeOptions: ThemeOption[] = [
  {
    id: "theme1",
    name: "Minimal Theme",
    description: "Clean monospace design with subtle shadows",
    colors: {
      primary: "#000000",
      background: "#ffffff",
      accent: "#f5f5f5"
    },
    preview: (
      <div className="space-y-2 p-3 bg-white border rounded-md text-black font-mono">
        <div className="w-8 h-8 bg-black rounded-full mx-auto"></div>
        <div className="space-y-1">
          <div className="h-2 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-1">
          <div className="h-6 bg-gray-100 border border-gray-200 rounded text-xs flex items-center justify-center">Link</div>
          <div className="h-6 bg-gray-100 border border-gray-200 rounded text-xs flex items-center justify-center">Link</div>
        </div>
      </div>
    )
  },
  {
    id: "theme2", 
    name: "Colorful Theme",
    description: "Bold design with vibrant colors and DM Sans font",
    colors: {
      primary: "#3b82f6",
      background: "#ffffff", 
      accent: "#dbeafe"
    },
    preview: (
      <div className="space-y-2 p-3 bg-white border rounded-md text-blue-600 font-sans">
        <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto"></div>
        <div className="space-y-1">
          <div className="h-2 bg-blue-100 rounded w-3/4 mx-auto"></div>
          <div className="h-2 bg-blue-100 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-1">
          <div className="h-6 bg-blue-500 text-white rounded text-xs flex items-center justify-center">Link</div>
          <div className="h-6 bg-blue-500 text-white rounded text-xs flex items-center justify-center">Link</div>
        </div>
      </div>
    )
  }
]

interface ThemeSelectorProps {
  value: "theme1" | "theme2"
  onValueChange: (value: "theme1" | "theme2") => void
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
          {themeOptions.map((theme) => {
            const isSelected = value === theme.id
            
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
                
                <p className="text-sm text-muted-foreground text-left">
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
                
                <div className="w-full">
                  {theme.preview}
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}