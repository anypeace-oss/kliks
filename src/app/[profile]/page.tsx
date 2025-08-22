import { db } from "@/lib/db";
import { profiles, links } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
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
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Type definitions
interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  backgroundImage?: string;
  isPublic: boolean;
  socialLinks?: Record<string, string>;
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

interface SocialIconMap {
  [key: string]: React.ComponentType<{ className?: string }>;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ profile: string }>;
}) {
  const { profile } = await params;

  // Fetch the profile from the database
  const profileResult = await db
    .select()
    .from(profiles)
    .where(eq(profiles.username, profile))
    .limit(1);

  if (!profileResult || profileResult.length === 0) {
    notFound();
  }

  const prof = profileResult[0] as ProfileData;

  // Only public profiles are visible
  if (!prof.isPublic) {
    notFound();
  }

  // Fetch links for this profile, sorted by sortOrder
  const allLinks = await db
    .select()
    .from(links)
    .where(eq(links.profileId, prof.id))
    .orderBy(asc(links.sortOrder));

  const now = new Date();
  const visibleLinks = allLinks.filter((l: LinkData) => {
    if (!l.isActive) return false;
    return true;
  });

  const SocialIcon = (name: string) => {
    const map: SocialIconMap = {
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
    const Icon = map[name];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="min-h-screen  flex flex-col items-center justify-center p-4 max-w-5xl mx-auto py-10">
      {/* Background Image */}
      {prof.backgroundImage && (
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${prof.backgroundImage})` }}
        />
      )}

      {/* Profile Info */}
      <div className="px-4 pb-10  relative">
        {/* Avatar */}
        <div className="relative">
          <Image
            src={prof.avatar || "/default-avatar.png"}
            alt={prof.displayName}
            className="w-24 h-24 rounded-full border-4 border-white bg-white"
            width={96}
            height={96}
          />
        </div>

        {/* Display Name */}
        <h1 className="text-2xl font-bold mt-4">{prof.displayName}</h1>

        {/* Username */}
        <p className="text-gray-600">@{prof.username}</p>

        {/* Bio */}
        {prof.bio && <p className="mt-2 text-gray-700">{prof.bio}</p>}

        {/* Social links */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {Object.entries(prof.socialLinks || {}).map(([platform, url]) => (
            <a
              key={platform}
              href={String(url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2"
              aria-label={platform}
            >
              {SocialIcon(platform)}
            </a>
          ))}
        </div>

        {/* Links */}
        <div className="mt-6 space-y-4">
          {visibleLinks.map((link: LinkData) => {
            return (
              <Button asChild variant={"default"} key={link.id}>
                <a
                  key={link.id}
                  href={link.url}
                  target={"_blank"}
                  rel={"noopener noreferrer"}
                  className="block w-full "
                >
                  <span className="flex  justify-between">
                    <span className="font-medium">{link.title}</span>
                    <ArrowUpRight/>
                  </span>
                </a>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
