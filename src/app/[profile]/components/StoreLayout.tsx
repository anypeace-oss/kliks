import Image from "next/image";
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
  Store,
} from "lucide-react";
import { ProfileButton } from "./ProfileButton";
import { type VariantProps } from "class-variance-authority";
import { buttonVariants } from "@/components/ui/button";

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

interface StoreLayoutProps {
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

export function StoreLayout({ profile, links }: StoreLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Background Image Header */}
      {profile.backgroundImage && (
        <div
          className="h-32 md:h-48 bg-cover bg-center w-full"
          style={{ backgroundImage: `url(${profile.backgroundImage})` }}
        />
      )}

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              {/* Avatar and Basic Info */}
              <div className="text-center lg:text-left mb-6">
                <div className="relative mb-4">
                  <Image
                    src={profile.avatar || "/default-avatar.png"}
                    alt={profile.displayName}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-background shadow-lg mx-auto lg:mx-0"
                    width={96}
                    height={96}
                  />
                </div>

                <h1 className="text-xl md:text-2xl font-bold mb-1">
                  {profile.displayName}
                </h1>
                <p className="text-muted-foreground mb-2">@{profile.username}</p>

                {profile.bio && (
                  <p className="text-sm text-foreground mb-4">{profile.bio}</p>
                )}
              </div>

              {/* Social Links - Vertical Layout */}
              {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4" />
                    Connect
                  </h3>
                  <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                    {Object.entries(profile.socialLinks).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={String(url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-accent transition-colors text-sm"
                        aria-label={platform}
                      >
                        {SocialIcon(platform)}
                        <span className="capitalize truncate">{platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Products/Links Grid */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">Products & Links</h2>
              <p className="text-muted-foreground text-sm">
                Explore all available items and links
              </p>
            </div>

            {/* Grid Layout for Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {links.map((link) => (
                <div key={link.id} className="w-full">
                  <ProfileButton
                    href={link.url}
                    variant={(profile.buttonVariant as VariantProps<typeof buttonVariants>["variant"]) || "default"}
                    className="h-auto p-4 text-left"
                  >
                    <div className="w-full">
                      <div className="font-medium text-sm">{link.title}</div>
                    </div>
                  </ProfileButton>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {links.length === 0 && (
              <div className="text-center py-12">
                <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground">
                  This store is being set up. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}