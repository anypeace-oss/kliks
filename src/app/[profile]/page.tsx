import { db } from "@/lib/db";
import { profiles, links } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ThemeLoader } from "./components/ThemeLoader";
import { LayoutRenderer } from "./components/LayoutRenderer";

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

  const visibleLinks = allLinks.filter((l: LinkData) => {
    if (!l.isActive) return false;
    return true;
  });

  // Default fallback values for theme and layout
  const schemeVariant = (prof.schemeVariant as "theme1" | "theme2") || "theme1";

  return (
    <>
      {/* Load theme CSS dynamically */}
      <ThemeLoader schemeVariant={schemeVariant} />

      {/* Render layout based on layoutVariant */}
      <LayoutRenderer profile={prof} links={visibleLinks} />
    </>
  );
}
