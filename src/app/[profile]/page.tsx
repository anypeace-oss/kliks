import { db } from "@/lib/db";
import { profiles, links as linksTable } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import * as Tabler from "@tabler/icons-react";
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
import Image from "next/image";

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

  const prof = profileResult[0];

  // Only public profiles are visible
  if (!prof.isPublic) {
    notFound();
  }

  // Fetch links for this profile (active only), sorted by sortOrder
  const allLinks = await db
    .select()
    .from(linksTable)
    .where(eq(linksTable.profileId, prof.id))
    .orderBy(asc(linksTable.sortOrder));

  const now = new Date();
  const profileLinks = allLinks.filter((l) => {
    if (!l.isActive) return false;
    if (l.scheduledStart && l.scheduledStart > now) return false;
    if (l.scheduledEnd && l.scheduledEnd < now) return false;
    return true;
  });

  const SocialIcon = (name: string) => {
    const map: Record<string, any> = {
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
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 max-w-5xl mx-auto py-10">
      {/* Background Image */}
      {prof.backgroundImage && (
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${prof.backgroundImage})` }}
        />
      )}

      {/* Profile Info */}
      <div className="px-4 pb-10 -mt-16 relative">
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
          {Object.entries((prof as any).socialLinks || {}).map(
            ([platform, url]) => (
              <a
                key={platform}
                href={String(url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-600 transition"
                aria-label={platform}
              >
                {SocialIcon(platform)}
              </a>
            )
          )}
        </div>

        {/* Links */}
        <div className="mt-6 space-y-3">
          {profileLinks.map((link) => {
            const TablerIcon: any = (Tabler as any)[link.icon || ""];
            const style: React.CSSProperties = {
              backgroundColor:
                link.buttonStyle?.backgroundColor || "transparent",
              color: (link.buttonStyle as any)?.textColor || "inherit",
              borderRadius: (link.buttonStyle as any)?.borderRadius || "9999px",
            };
            return (
              <a
                key={link.id}
                href={link.url || "#"}
                target={link.openInNewTab ? "_blank" : "_self"}
                rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                className="block w-full rounded-full border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition p-3 text-center"
                style={style}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  {link.thumbnail && (
                    <img
                      src={link.thumbnail}
                      alt="thumb"
                      className="w-5 h-5 rounded"
                    />
                  )}
                  {TablerIcon && <TablerIcon className="w-4 h-4" />}
                  <span className="font-medium">{link.title}</span>
                </span>
                {link.description && (
                  <div className="text-xs opacity-80 mt-1">
                    {link.description}
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
