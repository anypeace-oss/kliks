import { db } from "@/lib/db";
import { subscriptionPlans, userSubscriptions } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/link-in-bio/subscriptions - Get subscription plans and user subscriptions
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // plans, subscriptions, or all
    
    const result: any = {};
    
    if (type === "plans" || type === "all") {
      result.subscriptionPlans = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true));
    }
    
    if (type === "subscriptions" || type === "all") {
      result.userSubscriptions = await db
        .select()
        .from(userSubscriptions)
        .where(
          and(
            eq(userSubscriptions.userId, user.id)
          )
        );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription data" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/subscriptions - Create a new subscription
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // plan or subscription
    
    if (type === "subscription") {
      // Create new user subscription
      const newSubscription = await db
        .insert(userSubscriptions)
        .values({
          userId: user.id,
          planId: body.planId,
          status: body.status,
          startDate: body.startDate,
          endDate: body.endDate,
          paymentMethod: body.paymentMethod,
          paymentReference: body.paymentReference,
        })
        .returning();
      
      return NextResponse.json(newSubscription[0]);
    } else {
      return NextResponse.json(
        { error: "Subscription type is required (subscription)" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/subscriptions - Update a subscription
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }
    
    // Check if subscription belongs to the current user
    const existingSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.id, body.id),
          eq(userSubscriptions.userId, user.id)
        )
      );
    
    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: "Subscription not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Update subscription
    const updatedSubscription = await db
      .update(userSubscriptions)
      .set({
        planId: body.planId,
        status: body.status,
        startDate: body.startDate,
        endDate: body.endDate,
        paymentMethod: body.paymentMethod,
        paymentReference: body.paymentReference,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.id, body.id))
      .returning();
    
    return NextResponse.json(updatedSubscription[0]);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/subscriptions - Delete a subscription
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("id");
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }
    
    // Check if subscription belongs to the current user
    const existingSubscription = await db
      .select()
      .from(userSubscriptions)
      .where(
        and(
          eq(userSubscriptions.id, subscriptionId),
          eq(userSubscriptions.userId, user.id)
        )
      );
    
    if (existingSubscription.length === 0) {
      return NextResponse.json(
        { error: "Subscription not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Delete subscription
    await db
      .delete(userSubscriptions)
      .where(eq(userSubscriptions.id, subscriptionId));
    
    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}