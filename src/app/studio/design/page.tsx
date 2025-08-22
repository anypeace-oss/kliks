"use client"

import React from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { getProfiles, updateProfile } from "@/lib/api"
import { LayoutSelector } from "./components/LayoutSelector"
import { ThemeSelector } from "./components/ThemeSelector"
import { ButtonVariantSelector } from "./components/ButtonVariantSelector"
import { PreviewPanel } from "./components/PreviewPanel"

// Form schema for design settings
const DesignSettingsSchema = z.object({
  layoutVariant: z.enum(["default", "store"]).default("default"),
  schemeVariant: z.enum(["theme1", "theme2"]).default("theme1"),
  buttonVariant: z.enum(["default", "destructive", "outline", "secondary", "ghost", "link"]).default("default"),
})

type DesignSettingsForm = z.infer<typeof DesignSettingsSchema>

export default function DesignPage() {
  const queryClient = useQueryClient()
  
  // Form setup
  const form = useForm<DesignSettingsForm>({
    resolver: zodResolver(DesignSettingsSchema),
    defaultValues: {
      layoutVariant: "default",
      schemeVariant: "theme1", 
      buttonVariant: "default",
    }
  })

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: getProfiles,
  })

  // Get current user's profile (assuming first profile for now)
  const currentProfile = profiles?.[0]

  // Update form values when profile loads
  React.useEffect(() => {
    if (currentProfile) {
      form.reset({
        layoutVariant: currentProfile.layoutVariant || "default",
        schemeVariant: currentProfile.schemeVariant || "theme1",
        buttonVariant: currentProfile.buttonVariant || "default",
      })
    }
  }, [currentProfile, form])

  // Watch form values for live preview
  const watchedValues = form.watch()

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: DesignSettingsForm) => {
      if (!currentProfile?.id) throw new Error("No profile found")
      
      const updateData = {
        id: currentProfile.id,
        username: currentProfile.username,
        ...data
      }
      
      return updateProfile(updateData)
    },
    onSuccess: () => {
      toast.success("Design settings saved successfully!")
      queryClient.invalidateQueries({ queryKey: ["profiles"] })
    },
    onError: (error) => {
      console.error("Save error:", error)
      toast.error("Failed to save design settings")
    }
  })

  const handleSave = () => {
    const values = form.getValues()
    saveMutation.mutate(values)
  }

  const hasChanges = currentProfile && (
    watchedValues.layoutVariant !== (currentProfile.layoutVariant || "default") ||
    watchedValues.schemeVariant !== (currentProfile.schemeVariant || "theme1") ||
    watchedValues.buttonVariant !== (currentProfile.buttonVariant || "default")
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Design Settings</h1>
          <p className="text-muted-foreground">Customize your profile&apos;s layout and appearance</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || saveMutation.isPending}
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LayoutSelector
            value={watchedValues.layoutVariant}
            onValueChange={(value) => form.setValue("layoutVariant", value)}
          />
          
          <ThemeSelector
            value={watchedValues.schemeVariant}
            onValueChange={(value) => form.setValue("schemeVariant", value)}
          />
          
          <ButtonVariantSelector
            value={watchedValues.buttonVariant}
            onValueChange={(value) => form.setValue("buttonVariant", value)}
          />
        </div>
        
        <div className="lg:col-span-1">
          <PreviewPanel
            layout={watchedValues.layoutVariant}
            theme={watchedValues.schemeVariant}
            buttonVariant={watchedValues.buttonVariant}
          />
        </div>
      </div>
    </div>
  )
}