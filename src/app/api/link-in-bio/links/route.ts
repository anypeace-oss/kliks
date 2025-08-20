import { db } from "@/lib/db";
import { links, profiles } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/link-in-bio/links - Get all links for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    // First get all profiles for the user
    const userProfiles = await db
      .select({ id: links.profileId })
      .from(links)
      .innerJoin(profiles, eq(links.profileId, profiles.id))
      .where(eq(profiles.userId, user.id));
    
    // Get all links for those profiles
    const profileIds = userProfiles.map(profile => profile.id);
    
    if (profileIds.length === 0) {
      return NextResponse.json([]);
    }
    
    const userLinks = await db
      .select()
      .from(links)
      .where(inArray(links.profileId, profileIds)); // Get links for all profiles
    
    return NextResponse.json(userLinks);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/links - Create a new link for the current user
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    // Check if profile belongs to the current user
    const profile = await db
      .select()
      .from(profiles)
      .where(
        and(
          eq(profiles.id, body.profileId),
          eq(profiles.userId, user.id)
        )
      );
    
    if (profile.length === 0) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Create new link
    const newLink = await db
      .insert(links)
      .values({
        profileId: body.profileId,
        title: body.title,
        url: body.url,
        description: body.description,
        linkType: body.linkType || "external",
        icon: body.icon,
        thumbnail: body.thumbnail,
        isActive: body.isActive ?? true,
        openInNewTab: body.openInNewTab ?? true,
        sortOrder: body.sortOrder ?? 0,
      })
      .returning();
    
    return NextResponse.json(newLink[0]);
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/links - Update a link for the current user
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }
    
    // Check if link belongs to the current user
    const existingLink = await db
      .select()
      .from(links)
      .innerJoin(profiles, eq(links.profileId, profiles.id))
      .where(
        and(
          eq(links.id, body.id),
          eq(profiles.userId, user.id)
        )
      );
    
    if (existingLink.length === 0) {
      return NextResponse.json(
        { error: "Link not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Update link
    const updatedLink = await db
      .update(links)
      .set({
        title: body.title,
        url: body.url,
        description: body.description,
        linkType: body.linkType,
        icon: body.icon,
        thumbnail: body.thumbnail,
        isActive: body.isActive,
        openInNewTab: body.openInNewTab,
        sortOrder: body.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(links.id, body.id))
      .returning();
    
    return NextResponse.json(updatedLink[0]);
  } catch (error) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/links - Delete a link for the current user
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get("id");
    
    if (!linkId) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }
    
    // Check if link belongs to the current user
    const existingLink = await db
      .select()
      .from(links)
      .innerJoin(profiles, eq(links.profileId, profiles.id))
      .where(
        and(
          eq(links.id, linkId),
          eq(profiles.userId, user.id)
        )
      );
    
    if (existingLink.length === 0) {
      return NextResponse.json(
        { error: "Link not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Delete link
    await db
      .delete(links)
      .where(eq(links.id, linkId));
    
    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}