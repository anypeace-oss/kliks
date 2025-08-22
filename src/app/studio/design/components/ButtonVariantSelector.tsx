"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"

interface ButtonVariantOption {
  id: ButtonVariant
  name: string
  description: string
}

const buttonVariants: ButtonVariantOption[] = [
  { id: "default", name: "Default", description: "Standard button style" },
  { id: "destructive", name: "Destructive", description: "Bold red styling" },
  { id: "outline", name: "Outline", description: "Transparent with border" },
  { id: "secondary", name: "Secondary", description: "Subtle gray styling" },
  { id: "ghost", name: "Ghost", description: "Minimal hover effect" },
  { id: "link", name: "Link", description: "Text-only link style" }
]

interface ButtonVariantSelectorProps {
  value: ButtonVariant
  onValueChange: (value: ButtonVariant) => void
}

export function ButtonVariantSelector({ value, onValueChange }: ButtonVariantSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Button Style</CardTitle>
        <CardDescription>
          Choose how your profile links and buttons will appear
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {buttonVariants.map((variant) => (
            <Button
              key={variant.id}
              variant={variant.id}
              size="sm"
              className={`h-auto p-3 flex flex-col items-center justify-center gap-2 ${
                value === variant.id ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              onClick={() => onValueChange(variant.id)}
            >
              <span className="text-sm font-medium">{variant.name}</span>
              <span className="text-xs opacity-70 text-center leading-tight">
                {variant.description}
              </span>
            </Button>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <Button variant={value} size="sm">
            Sample Link
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}