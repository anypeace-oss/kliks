import { db } from "@/lib/db";
import {
  affiliatePrograms,
  affiliates,
  affiliateCommissions,
  digitalProducts,
} from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  AffiliateProgramCreateSchema,
  AffiliateProgramUpdateSchema,
  AffiliateCreateSchema,
  AffiliateUpdateSchema,
} from "@/lib/validation/link-in-bio";

// GET /api/link-in-bio/affiliates - Get all affiliate data for the current user
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // programs, affiliates, clicks, commissions, or all

    const result: Record<string, unknown> = {};

    if (type === "programs" || type === "all") {
      // Get affiliate programs for user's products
      const userProducts = await db
        .select({ id: digitalProducts.id })
        .from(digitalProducts)
        .where(eq(digitalProducts.userId, user.id));

      const productIds = userProducts.map((product) => product.id);

      if (productIds.length > 0) {
        result.affiliatePrograms = await db
          .select()
          .from(affiliatePrograms)
          .where(inArray(affiliatePrograms.productId, productIds));
      } else {
        result.affiliatePrograms = [];
      }
    }

    if (type === "affiliates" || type === "all") {
      // Get affiliates for user's programs
      const userPrograms = await db
        .select({ id: affiliatePrograms.id })
        .from(affiliatePrograms)
        .innerJoin(
          digitalProducts,
          eq(affiliatePrograms.productId, digitalProducts.id)
        )
        .where(eq(digitalProducts.userId, user.id));

      const programIds = userPrograms.map((program) => program.id);

      if (programIds.length > 0) {
        result.affiliates = await db
          .select()
          .from(affiliates)
          .where(inArray(affiliates.affiliateProgramId, programIds));
      } else {
        result.affiliates = [];
      }
    }

    if (type === "commissions" || type === "all") {
      // Get commissions for user's affiliate programs
      const userPrograms = await db
        .select({ id: affiliatePrograms.id })
        .from(affiliatePrograms)
        .innerJoin(
          digitalProducts,
          eq(affiliatePrograms.productId, digitalProducts.id)
        )
        .where(eq(digitalProducts.userId, user.id));

      const programIds = userPrograms.map((program) => program.id);

      if (programIds.length > 0) {
        const userAffiliates = await db
          .select({ id: affiliates.id })
          .from(affiliates)
          .where(inArray(affiliates.affiliateProgramId, programIds));

        const affiliateIds = userAffiliates.map((affiliate) => affiliate.id);

        if (affiliateIds.length > 0) {
          result.commissions = await db
            .select()
            .from(affiliateCommissions)
            .where(inArray(affiliateCommissions.affiliateId, affiliateIds));
        } else {
          result.commissions = [];
        }
      } else {
        result.commissions = [];
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate data" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/affiliates - Create a new affiliate program or affiliate relationship
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const json = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // program, affiliate, or commission

    if (type === "program") {
      const parsed = AffiliateProgramCreateSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", issues: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const body = parsed.data;
      // Check if product belongs to the current user
      const product = await db
        .select()
        .from(digitalProducts)
        .where(
          and(
            eq(digitalProducts.id, body.productId),
            eq(digitalProducts.userId, user.id)
          )
        );

      if (product.length === 0) {
        return NextResponse.json(
          { error: "Product not found or unauthorized" },
          { status: 404 }
        );
      }

      // Create new affiliate program
      const newProgram = await db
        .insert(affiliatePrograms)
        .values({
          productId: body.productId,
          commissionType: body.commissionType || "percentage",
          commissionValue: body.commissionValue,
          isActive: body.isActive ?? true,
          requiresApproval: body.requiresApproval ?? false,
          description: body.description,
          terms: body.terms,
        })
        .returning();

      return NextResponse.json(newProgram[0]);
    } else if (type === "affiliate") {
      const parsed = AffiliateCreateSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", issues: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const body = parsed.data;
      // Create new affiliate relationship
      const newAffiliate = await db
        .insert(affiliates)
        .values({
          affiliateProgramId: body.affiliateProgramId,
          affiliateUserId: body.affiliateUserId,
          affiliateCode: body.affiliateCode,
          status: body.status || "pending",
        })
        .returning();

      return NextResponse.json(newAffiliate[0]);
    } else {
      return NextResponse.json(
        { error: "Affiliate type is required (program or affiliate)" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to create affiliate data" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/affiliates - Update affiliate data
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const json = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // program, affiliate, or commission

    if (type === "program") {
      const parsed = AffiliateProgramUpdateSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", issues: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const body = parsed.data;
      // Check if program belongs to the current user
      const program = await db
        .select()
        .from(affiliatePrograms)
        .innerJoin(
          digitalProducts,
          eq(affiliatePrograms.productId, digitalProducts.id)
        )
        .where(
          and(
            eq(affiliatePrograms.id, body.id),
            eq(digitalProducts.userId, user.id)
          )
        );

      if (program.length === 0) {
        return NextResponse.json(
          { error: "Affiliate program not found or unauthorized" },
          { status: 404 }
        );
      }

      // Update affiliate program
      const updatedProgram = await db
        .update(affiliatePrograms)
        .set({
          commissionType: body.commissionType,
          commissionValue: body.commissionValue,
          isActive: body.isActive,
          requiresApproval: body.requiresApproval,
          description: body.description,
          terms: body.terms,
          updatedAt: new Date(),
        })
        .where(eq(affiliatePrograms.id, body.id))
        .returning();

      return NextResponse.json(updatedProgram[0]);
    } else if (type === "affiliate") {
      const parsed = AffiliateUpdateSchema.safeParse(json);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", issues: parsed.error.flatten() },
          { status: 400 }
        );
      }
      const body = parsed.data;
      // Check if affiliate belongs to the current user's program
      const affiliate = await db
        .select()
        .from(affiliates)
        .innerJoin(
          affiliatePrograms,
          eq(affiliates.affiliateProgramId, affiliatePrograms.id)
        )
        .innerJoin(
          digitalProducts,
          eq(affiliatePrograms.productId, digitalProducts.id)
        )
        .where(
          and(eq(affiliates.id, body.id), eq(digitalProducts.userId, user.id))
        );

      if (affiliate.length === 0) {
        return NextResponse.json(
          { error: "Affiliate not found or unauthorized" },
          { status: 404 }
        );
      }

      // Update affiliate
      const updatedAffiliate = await db
        .update(affiliates)
        .set({
          status: body.status,
          approvedAt: body.approvedAt,
          updatedAt: new Date(),
        })
        .where(eq(affiliates.id, body.id))
        .returning();

      return NextResponse.json(updatedAffiliate[0]);
    } else {
      return NextResponse.json(
        { error: "Affiliate type is required (program or affiliate)" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to update affiliate data" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/affiliates - Delete affiliate data
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type"); // program, affiliate, or commission

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (type === "program") {
      // Check if program belongs to the current user
      const program = await db
        .select()
        .from(affiliatePrograms)
        .innerJoin(
          digitalProducts,
          eq(affiliatePrograms.productId, digitalProducts.id)
        )
        .where(
          and(eq(affiliatePrograms.id, id), eq(digitalProducts.userId, user.id))
        );

      if (program.length === 0) {
        return NextResponse.json(
          { error: "Affiliate program not found or unauthorized" },
          { status: 404 }
        );
      }

      // Delete affiliate program
      await db.delete(affiliatePrograms).where(eq(affiliatePrograms.id, id));

      return NextResponse.json({
        message: "Affiliate program deleted successfully",
      });
    } else if (type === "affiliate") {
      // Check if affiliate belongs to the current user's program
      const affiliate = await db
        .select()
        .from(affiliates)
        .innerJoin(
          affiliatePrograms,
          eq(affiliates.affiliateProgramId, affiliatePrograms.id)
        )
        .innerJoin(
          digitalProducts,
          eq(affiliatePrograms.productId, digitalProducts.id)
        )
        .where(and(eq(affiliates.id, id), eq(digitalProducts.userId, user.id)));

      if (affiliate.length === 0) {
        return NextResponse.json(
          { error: "Affiliate not found or unauthorized" },
          { status: 404 }
        );
      }

      // Delete affiliate
      await db.delete(affiliates).where(eq(affiliates.id, id));

      return NextResponse.json({ message: "Affiliate deleted successfully" });
    } else {
      return NextResponse.json(
        { error: "Affiliate type is required (program or affiliate)" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting affiliate data:", error);
    return NextResponse.json(
      { error: "Failed to delete affiliate data" },
      { status: 500 }
    );
  }
}
