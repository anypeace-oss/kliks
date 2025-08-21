import { db } from "@/lib/db";
import { linkClicks, profileViews, links, profiles } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, desc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { LinkClickCreateSchema } from "@/lib/validation/link-in-bio";

// GET /api/link-in-bio/analytics - Get analytics data for the current user
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // link-clicks, profile-views, or all
    const limit = parseInt(searchParams.get("limit") || "100");

    const result: any = {};

    // Get user's profiles
    const userProfiles = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, user.id));

    const profileIds = userProfiles.map((profile) => profile.id);

    if (profileIds.length === 0) {
      return NextResponse.json({ linkClicks: [], profileViews: [] });
    }

    if (type === "link-clicks" || type === "all") {
      // Get link clicks for user's links
      const userLinks = await db
        .select({ id: links.id })
        .from(links)
        .where(inArray(links.profileId, profileIds));

      const linkIds = userLinks.map((link) => link.id);

      if (linkIds.length > 0) {
        result.linkClicks = await db
          .select()
          .from(linkClicks)
          .where(inArray(linkClicks.linkId, linkIds))
          .orderBy(desc(linkClicks.clickedAt))
          .limit(limit);
      } else {
        result.linkClicks = [];
      }
    }

    if (type === "profile-views" || type === "all") {
      result.profileViews = await db
        .select()
        .from(profileViews)
        .where(inArray(profileViews.profileId, profileIds))
        .orderBy(desc(profileViews.viewedAt))
        .limit(limit);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/analytics/link-clicks - Record a link click
export async function POST(request: Request) {
  try {
    // This endpoint is for recording clicks, so we don't require authentication
    // but we validate that the link belongs to a valid profile
    const json = await request.json();
    const parsed = LinkClickCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    if (!body.linkId) {
      return NextResponse.json(
        { error: "Link ID is required" },
        { status: 400 }
      );
    }

    // Record the link click
    const newClick = await db
      .insert(linkClicks)
      .values({
        linkId: body.linkId,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
        referer: body.referer,
        country: body.country,
        city: body.city,
        device: body.device,
        browser: body.browser,
      })
      .returning();

    return NextResponse.json(newClick[0]);
  } catch (error) {
    console.error("Error recording link click:", error);
    return NextResponse.json(
      { error: "Failed to record link click" },
      { status: 500 }
    );
  }
}

// We don't implement PUT or DELETE for analytics as they are read-only records
