import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, ne } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/link-in-bio/profiles/check-username?username=<username>&excludeId=<profileId>
export async function GET(request: Request) {
  try {
    await getCurrentUser(); // Ensure user is authenticated
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");
    const excludeId = searchParams.get("excludeId");

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Check if username is available (exclude current profile if editing)
    const whereConditions = excludeId 
      ? and(eq(profiles.username, username), ne(profiles.id, excludeId))
      : eq(profiles.username, username);

    const existingProfile = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(whereConditions);

    const isAvailable = existingProfile.length === 0;

    return NextResponse.json({ 
      available: isAvailable,
      username: username
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Failed to check username availability" },
      { status: 500 }
    );
  }
}