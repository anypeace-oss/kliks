import { db } from "@/lib/db";
import { blocks, profiles } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  BlockCreateSchema,
  BlockUpdateSchema,
} from "@/lib/validation/link-in-bio";

// GET /api/link-in-bio/blocks - Get all blocks for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();

    const userProfiles = await db
      .select({ id: blocks.profileId })
      .from(blocks)
      .innerJoin(profiles, eq(blocks.profileId, profiles.id))
      .where(eq(profiles.userId, user.id));

    const profileIds = userProfiles.map((p) => p.id);
    if (profileIds.length === 0) return NextResponse.json([]);

    const userBlocks = await db
      .select()
      .from(blocks)
      .where(inArray(blocks.profileId, profileIds));

    return NextResponse.json(userBlocks);
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocks" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/blocks - Create a new block
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const json = await request.json();
    const parsed = BlockCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const profile = await db
      .select()
      .from(profiles)
      .where(
        and(eq(profiles.id, body.profileId), eq(profiles.userId, user.id))
      );

    if (profile.length === 0) {
      return NextResponse.json(
        { error: "Profile not found or unauthorized" },
        { status: 404 }
      );
    }

    const newBlock = await db
      .insert(blocks)
      .values({
        profileId: body.profileId,
        title: body.title,
        url: body.url,
        description: body.description,
        type: body.type || "link",
        productId: body.productId,
        affiliateId: body.affiliateId,
        config: body.config,
        isActive: body.isActive ?? true,
        openInNewTab: body.openInNewTab ?? true,
        sortOrder: body.sortOrder ?? 0,
        scheduledStart: body.scheduledStart,
        scheduledEnd: body.scheduledEnd,
        clickLimit: body.clickLimit,
        password: body.password,
      })
      .returning();

    return NextResponse.json(newBlock[0]);
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json(
      { error: "Failed to create block" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/blocks - Update a block
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const json = await request.json();
    const parsed = BlockUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const existing = await db
      .select()
      .from(blocks)
      .innerJoin(profiles, eq(blocks.profileId, profiles.id))
      .where(and(eq(blocks.id, body.id), eq(profiles.userId, user.id)));

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Block not found or unauthorized" },
        { status: 404 }
      );
    }

    const updated = await db
      .update(blocks)
      .set({
        title: body.title,
        url: body.url,
        description: body.description,
        type: body.type,
        productId: body.productId,
        affiliateId: body.affiliateId,
        config: body.config,
        isActive: body.isActive,
        openInNewTab: body.openInNewTab,
        sortOrder: body.sortOrder,
        scheduledStart: body.scheduledStart,
        scheduledEnd: body.scheduledEnd,
        clickLimit: body.clickLimit,
        password: body.password,
        updatedAt: new Date(),
      })
      .where(eq(blocks.id, body.id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating block:", error);
    return NextResponse.json(
      { error: "Failed to update block" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/blocks - Delete a block
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get("id");

    if (!blockId) {
      return NextResponse.json(
        { error: "Block ID is required" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(blocks)
      .innerJoin(profiles, eq(blocks.profileId, profiles.id))
      .where(and(eq(blocks.id, blockId), eq(profiles.userId, user.id)));

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Block not found or unauthorized" },
        { status: 404 }
      );
    }

    await db.delete(blocks).where(eq(blocks.id, blockId));
    return NextResponse.json({ message: "Block deleted successfully" });
  } catch (error) {
    console.error("Error deleting block:", error);
    return NextResponse.json(
      { error: "Failed to delete block" },
      { status: 500 }
    );
  }
}
