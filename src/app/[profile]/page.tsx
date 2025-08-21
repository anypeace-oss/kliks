import { db } from "@/lib/db";
import { profiles, blocks as blocksTable } from "@/lib/schema";
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

interface BlockData {
  id: string;
  profileId: string;
  type: string;
  title: string | null;
  url: string | null;
  description: string | null;
  isActive: boolean;
  openInNewTab: boolean | null;
  sortOrder: number;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  productId: string | null;
  affiliateId: string | null;
  config: {
    icon?: string;
    thumbnail?: string;
    imageUrl?: string;
    alt?: string;
    text?: string;
    buttonStyle?: {
      backgroundColor?: string;
      textColor?: string;
      borderRadius?: string;
    };
    [key: string]: unknown;
  } | null;
  clickLimit: number | null;
  password: string | null;
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

  // Fetch blocks for this profile, sorted by sortOrder
  const allBlocks = await db
    .select()
    .from(blocksTable)
    .where(eq(blocksTable.profileId, prof.id))
    .orderBy(asc(blocksTable.sortOrder));

  const now = new Date();
  const visibleBlocks = allBlocks.filter((b: BlockData) => {
    if (!b.isActive) return false;
    if (b.scheduledStart && b.scheduledStart > now) return false;
    if (b.scheduledEnd && b.scheduledEnd < now) return false;
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
          {Object.entries(prof.socialLinks || {}).map(
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

        {/* Blocks */}
        <div className="mt-6 space-y-4">
          {visibleBlocks.map((block: BlockData) => {
            const cfg = block.config || {};
            if (block.type === "separator") {
              return <hr key={block.id} className="border-gray-200" />;
            }
            if (block.type === "text") {
              return (
                <div key={block.id} className="text-gray-800">
                  {cfg.text || block.title}
                </div>
              );
            }
            if (block.type === "image") {
              const src = cfg.imageUrl || cfg.thumbnail;
              if (!src) return null;
              return (
                <Image
                  key={block.id}
                  src={src}
                  alt={cfg.alt || block.title || "image"}
                  className="w-full rounded-lg"
                  width={600}
                  height={400}
                />
              );
            }
            // link/product/affiliate style button
            const TablerIcon = cfg.icon ? (Tabler as unknown as Record<string, React.ComponentType<{ className?: string }>>)[cfg.icon] : undefined;
            const style: React.CSSProperties = {
              backgroundColor:
                cfg.buttonStyle?.backgroundColor || "transparent",
              color: cfg.buttonStyle?.textColor || "inherit",
              borderRadius: cfg.buttonStyle?.borderRadius || "9999px",
            };
            return (
              <a
                key={block.id}
                href={block.url || "#"}
                target={block.openInNewTab ? "_blank" : "_self"}
                rel={block.openInNewTab ? "noopener noreferrer" : undefined}
                className="block w-full rounded-full border-2 border-gray-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition p-3 text-center"
                style={style}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  {cfg.thumbnail && (
                    <Image
                      src={cfg.thumbnail}
                      alt="thumb"
                      className="w-5 h-5 rounded"
                      width={20}
                      height={20}
                    />
                  )}
                  {TablerIcon && <TablerIcon className="w-4 h-4" />}
                  <span className="font-medium">{block.title}</span>
                </span>
                {block.description && (
                  <div className="text-xs opacity-80 mt-1">
                    {block.description}
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
