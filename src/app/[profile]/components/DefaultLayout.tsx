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

interface DefaultLayoutProps {
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

export function DefaultLayout({ profile, links }: DefaultLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 max-w-2xl mx-auto py-10">
      {/* Background Image */}
      {profile.backgroundImage && (
        <div
          className="h-48 bg-cover bg-center w-full rounded-lg mb-6"
          style={{ backgroundImage: `url(${profile.backgroundImage})` }}
        />
      )}

      {/* Profile Info */}
      <div className="px-4 pb-10 relative w-full text-center">
        {/* Avatar */}
        <div className="relative mb-4">
          <Image
            src={profile.avatar || "/default-avatar.png"}
            alt={profile.displayName}
            className="w-24 h-24 rounded-full border-4 border-white bg-white mx-auto"
            width={96}
            height={96}
          />
        </div>

        {/* Display Name */}
        <h1 className="text-2xl font-bold mb-2">{profile.displayName}</h1>

        {/* Username */}
        <p className="text-muted-foreground mb-2">@{profile.username}</p>

        {/* Bio */}
        {profile.bio && (
          <p className="mb-4 text-foreground max-w-md mx-auto">{profile.bio}</p>
        )}

        {/* Social links */}
        {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
          <div className="mb-6 flex items-center justify-center gap-3 flex-wrap">
            {Object.entries(profile.socialLinks).map(([platform, url]) => (
              <a
                key={platform}
                href={String(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-border hover:bg-accent transition-colors"
                aria-label={platform}
              >
                {SocialIcon(platform)}
              </a>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="space-y-4 w-full max-w-md mx-auto">
          {links.map((link) => (
            <ProfileButton
              key={link.id}
              href={link.url}
              variant={(profile.buttonVariant as VariantProps<typeof buttonVariants>["variant"]) || "default"}
            >
              {link.title}
            </ProfileButton>
          ))}
        </div>
      </div>
    </div>
  );
}