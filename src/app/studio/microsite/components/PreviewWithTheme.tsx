"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { type VariantProps } from "class-variance-authority";
import {
  Instagram,
  Music,
  Youtube,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  Send,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import {
  getThemeById,
  AVAILABLE_THEMES,
} from "../../../../lib/theme-config";

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  backgroundImage?: string;
  isPublic: boolean;
  socialLinks?: Record<string, string>;
  layoutVariant?: string;
  schemeVariant?: string;
  buttonVariant?: string;
}

interface LinkData {
  id: string;
  profileId: string;
  title: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PreviewWithThemeProps {
  profile: ProfileData;
  links: LinkData[];
}

const SocialIcon = (name: string) => {
  const map = {
    instagram: Instagram,
    tiktok: Music,
    youtube: Youtube,
    email: Mail,
    facebook: Facebook,
    twitter: Twitter,
    linkedin: Linkedin,
    github: Github,
    telegram: Send,
    whatsapp: MessageCircle,
  };
  const Icon = map[name as keyof typeof map];
  return Icon ? <Icon className="w-4 h-4" /> : null;
};

export function PreviewWithTheme({ profile, links }: PreviewWithThemeProps) {
  const [themeStyles, setThemeStyles] = useState<Record<string, string>>({});
  const activeLinks = links
    .filter((link) => link.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Get design settings with defaults
  const layoutVariant = profile?.layoutVariant || "default";
  const schemeVariant = profile?.schemeVariant || "theme1";
  const buttonVariant = profile?.buttonVariant || "default";

  // Validate theme
  const currentTheme = getThemeById(schemeVariant);
  const fallbackTheme = AVAILABLE_THEMES[0];
  const themeToUse = currentTheme || fallbackTheme;

  // Layout classes based on layoutVariant
  const isStoreLayout = layoutVariant === "store";

  // Load theme CSS and extract CSS variables for isolated application
  useEffect(() => {
    const loadThemeCss = async () => {
      try {
        const response = await fetch(`/themes/${themeToUse.cssFile}`);
        const cssText = await response.text();

        // Parse CSS variables from :root selector
        const rootMatch = cssText.match(/:root\s*{([^}]*)}/);
        if (rootMatch) {
          const variables = rootMatch[1]
            .split(";")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("--") && line.includes(":"))
            .reduce((acc, line) => {
              const colonIndex = line.indexOf(":");
              if (colonIndex > 0) {
                const prop = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim();
                if (prop && value) {
                  acc[prop] = value;
                }
              }
              return acc;
            }, {} as Record<string, string>);

          setThemeStyles(variables);
        }
      } catch (error) {
        console.error("Failed to load theme CSS:", error);
      }
    };

    loadThemeCss();
  }, [themeToUse]);

  return (
    <div className="space-y-4">
      {/* Theme indicator */}
      <div className="text-sm text-muted-foreground">
        Preview: {themeToUse.name}
      </div>

      {/* Preview container with theme isolation */}
      <div className="w-64 h-[500px] border-4 border-gray-300 rounded-[2.5rem] p-2 mx-auto bg-gray-100">
        {/* Theme wrapper - CSS variables applied only to this container */}
        <div
          className="w-full h-full rounded-[2rem] overflow-hidden"
          style={{
            backgroundColor: themeStyles["--background"] || "#ffffff",
            color: themeStyles["--foreground"] || "#000000",
            // Apply all theme variables as CSS custom properties
            ...Object.entries(themeStyles).reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {} as Record<string, string>),
          }}
        >
          <div className="pt-10 px-6 pb-6 h-full overflow-y-auto">
            <div className="text-center space-y-4">
              {/* Avatar */}
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarImage
                  src={profile?.avatar}
                  alt={profile?.displayName || profile?.username}
                />
                <AvatarFallback className="text-2xl">
                  {(profile?.displayName || profile?.username || "")
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div>
                <h2
                  className="text-lg font-semibold"
                  style={{ color: themeStyles["--primary"] || "#000000" }}
                >
                  {profile?.displayName || profile?.username || ""}
                </h2>
                {profile?.bio && (
                  <p
                    className="text-sm mt-1"
                    style={{
                      color: themeStyles["--muted-foreground"] || "#666666",
                    }}
                  >
                    {profile.bio}
                  </p>
                )}

                {/* Social Links */}
                {profile?.socialLinks &&
                  Object.keys(profile.socialLinks).length > 0 && (
                    <div className="flex justify-center gap-2 pt-2">
                      {Object.entries(profile.socialLinks).map(
                        ([platform, url]) => (
                          <Button
                            key={platform}
                            asChild
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 rounded-full border-2"
                            style={{
                              borderColor: themeStyles["--border"] || "#e2e8f0",
                              backgroundColor:
                                themeStyles["--background"] || "#ffffff",
                              color: themeStyles["--foreground"] || "#000000",
                            }}
                          >
                            <a
                              href={String(url)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {SocialIcon(platform)}
                            </a>
                          </Button>
                        )
                      )}
                    </div>
                  )}
              </div>

              {/* Links */}
              <div
                className={
                  isStoreLayout ? "grid grid-cols-2 gap-2" : "space-y-3"
                }
              >
                {activeLinks.map((link) => {
                  const getButtonStyles = () => {
                    switch (buttonVariant) {
                      case "outline":
                        return {
                          borderColor: themeStyles["--input"] || "#e2e8f0",
                          backgroundColor:
                            themeStyles["--background"] || "#ffffff",
                          color: themeStyles["--foreground"] || "#000000",
                        };
                      case "secondary":
                        return {
                          backgroundColor:
                            themeStyles["--secondary"] || "#f1f5f9",
                          color:
                            themeStyles["--secondary-foreground"] || "#0f172a",
                        };
                      default:
                        return {
                          backgroundColor:
                            themeStyles["--primary"] || "#0f172a",
                          color:
                            themeStyles["--primary-foreground"] || "#f8fafc",
                        };
                    }
                  };

                  return (
                    <Button
                      key={link.id}
                      asChild
                      variant={
                        (buttonVariant as VariantProps<
                          typeof buttonVariants
                        >["variant"]) || "default"
                      }
                      className={
                        isStoreLayout
                          ? "h-16 text-xs flex flex-col p-2"
                          : "w-full py-3 text-sm font-medium rounded-full border-2"
                      }
                      style={getButtonStyles()}
                    >
                      <a
                        href={link.url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-between"
                      >
                        <span
                          className={
                            isStoreLayout
                              ? "font-medium truncate"
                              : "font-medium"
                          }
                        >
                          {link.title || "Untitled"}
                        </span>
                        {!isStoreLayout && <ArrowUpRight className="w-4 h-4" />}
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
