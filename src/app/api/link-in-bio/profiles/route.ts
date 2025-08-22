import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  ProfileCreateSchema,
  ProfileUpdateSchema,
} from "@/lib/validation/link-in-bio";

// GET /api/link-in-bio/profiles - Get all profiles for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();

    const userProfiles = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id));

    return NextResponse.json(userProfiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch profiles" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/profiles - Create a new profile for the current user
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const json = await request.json();
    const parsed = ProfileCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Check if user already has a profile with this username
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(
        and(eq(profiles.userId, user.id), eq(profiles.username, body.username))
      );

    if (existingProfile.length > 0) {
      return NextResponse.json(
        { error: "Profile with this username already exists" },
        { status: 400 }
      );
    }

    // Create new profile
    const newProfile = await db
      .insert(profiles)
      .values({
        userId: user.id,
        username: body.username,
        displayName: body.displayName || body.username,
        bio: body.bio,
        avatar: body.avatar,
        isPublic: body.isPublic ?? true,
        socialLinks: body.socialLinks,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        layoutVariant: body.layoutVariant ?? "default",
        schemeVariant: body.schemeVariant ?? "theme1",
        buttonVariant: body.buttonVariant ?? "default",
      })
      .returning();

    return NextResponse.json(newProfile[0]);
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/profiles - Update a profile for the current user
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const json = await request.json();
    const parsed = ProfileUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Check if profile belongs to the current user
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(and(eq(profiles.id, body.id), eq(profiles.userId, user.id)));

    if (existingProfile.length === 0) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update profile
    const updatedProfile = await db
      .update(profiles)
      .set({
        username: body.username,
        displayName: body.displayName,
        bio: body.bio,
        avatar: body.avatar,
        isPublic: body.isPublic,
        socialLinks: body.socialLinks,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        layoutVariant: body.layoutVariant,
        schemeVariant: body.schemeVariant,
        buttonVariant: body.buttonVariant,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, body.id))
      .returning();

    return NextResponse.json(updatedProfile[0]);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/profiles - Delete a profile for the current user
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    // Check if profile belongs to the current user
    const existingProfile = await db
      .select()
      .from(profiles)
      .where(and(eq(profiles.id, profileId), eq(profiles.userId, user.id)));

    if (existingProfile.length === 0) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete profile
    await db.delete(profiles).where(eq(profiles.id, profileId));

    return NextResponse.json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
