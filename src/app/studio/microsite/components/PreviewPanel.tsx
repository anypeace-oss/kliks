"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Instagram, Twitter, Globe, Mail } from "lucide-react"

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"

interface PreviewPanelProps {
  layout: "default" | "store"
  theme: "theme1" | "theme2"
  buttonVariant: ButtonVariant
}

const mockProfile = {
  username: "preview",
  displayName: "Preview User",
  bio: "This is how your profile will look with the selected design.",
  avatar: "/placeholder-avatar.jpg",
  socialLinks: {
    instagram: "https://instagram.com/preview",
    twitter: "https://twitter.com/preview",
    website: "https://example.com",
    email: "preview@example.com"
  }
}

const mockLinks = [
  { id: "1", title: "My Website", url: "https://example.com", isActive: true },
  { id: "2", title: "Latest Project", url: "https://project.com", isActive: true },
  { id: "3", title: "Portfolio", url: "https://portfolio.com", isActive: true },
  { id: "4", title: "Contact Me", url: "https://contact.com", isActive: true }
]

const mockProducts = [
  { id: "1", name: "Digital Course", price: "$49" },
  { id: "2", name: "E-book", price: "$19" },
  { id: "3", name: "Template Pack", price: "$29" },
  { id: "4", name: "Video Series", price: "$99" }
]

export function PreviewPanel({ layout, theme, buttonVariant }: PreviewPanelProps) {
  const themeClasses = theme === "theme1" 
    ? "bg-white text-black font-mono" 
    : "bg-white text-blue-900 font-sans"

  const containerClasses = layout === "default" 
    ? "space-y-4" 
    : "space-y-4"

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
        <CardDescription>
          See how your profile will look on mobile devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-64 h-[500px] border-4 border-muted rounded-[2.5rem] p-2 mx-auto overflow-hidden">
          <div className={`w-full h-full rounded-[2rem] overflow-hidden p-4 ${themeClasses}`}>
            <div className={containerClasses}>
              {/* Profile Header */}
              <div className="text-center space-y-3">
                <Avatar className="w-16 h-16 mx-auto">
                  <AvatarImage src={mockProfile.avatar} />
                  <AvatarFallback>PU</AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-lg font-bold">{mockProfile.displayName}</h1>
                  <p className="text-sm opacity-70">@{mockProfile.username}</p>
                </div>
                
                <p className="text-xs opacity-80 leading-relaxed">
                  {mockProfile.bio}
                </p>
                
                {/* Social Links */}
                <div className="flex justify-center gap-2">
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Instagram className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Twitter className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Globe className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-6 h-6">
                    <Mail className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Links/Products Grid */}
              {layout === "default" ? (
                <div className="space-y-2">
                  {mockLinks.slice(0, 3).map((link) => (
                    <Button
                      key={link.id}
                      variant={buttonVariant}
                      size="sm"
                      className="w-full text-xs h-8"
                    >
                      {link.title}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {mockProducts.map((product) => (
                    <Button
                      key={product.id}
                      variant={buttonVariant}
                      size="sm"
                      className="h-16 text-xs flex flex-col p-2"
                    >
                      <span className="font-medium truncate w-full">{product.name}</span>
                      <span className="text-xs opacity-70">{product.price}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Layout: <span className="font-medium capitalize">{layout}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Theme: <span className="font-medium capitalize">{theme}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Buttons: <span className="font-medium capitalize">{buttonVariant}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}