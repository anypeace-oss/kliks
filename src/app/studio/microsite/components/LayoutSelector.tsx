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
import { Check, Layout, Store } from "lucide-react";

interface LayoutOption {
  id: "default" | "store";
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  preview: React.ReactNode;
}

const layoutOptions: LayoutOption[] = [
  {
    id: "default",
    name: "Default Layout",
    description: "Single column centered design perfect for content creators",
    icon: Layout,
    preview: (
      <div className="space-y-2 p-3 bg-background border rounded-md">
        <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto"></div>
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-2 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-1">
          <div className="h-6 bg-primary/10 rounded"></div>
          <div className="h-6 bg-primary/10 rounded"></div>
          <div className="h-6 bg-primary/10 rounded"></div>
        </div>
      </div>
    ),
  },
  {
    id: "store",
    name: "Store Layout",
    description: "Two-column grid optimized for showcasing digital products",
    icon: Store,
    preview: (
      <div className="space-y-2 p-3 bg-background border rounded-md">
        <div className="w-8 h-8 bg-primary/20 rounded-full mx-auto"></div>
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-2 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="h-12 bg-primary/10 rounded"></div>
          <div className="h-12 bg-primary/10 rounded"></div>
          <div className="h-12 bg-primary/10 rounded"></div>
          <div className="h-12 bg-primary/10 rounded"></div>
        </div>
      </div>
    ),
  },
];

interface LayoutSelectorProps {
  value: "default" | "store";
  onValueChange: (value: "default" | "store") => void;
}

export function LayoutSelector({ value, onValueChange }: LayoutSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout Style</CardTitle>
        <CardDescription>
          Choose how your profile content is organized and displayed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {layoutOptions.map((layout) => {
            const Icon = layout.icon;
            const isSelected = value === layout.id;

            return (
              <Button
                key={layout.id}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-start gap-3 relative ${
                  isSelected
                    ? "border-primary bg-primary/5 hover:bg-primary/10"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onValueChange(layout.id)}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}

                <div className="flex items-center gap-2 w-full">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-left">{layout.name}</span>
                </div>

                <p className="text-sm text-muted-foreground text-left max-w-xs ">
                  {layout.description}
                </p>

                <div className="w-full">{layout.preview}</div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
