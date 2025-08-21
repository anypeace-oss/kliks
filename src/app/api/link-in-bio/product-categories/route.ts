import { db } from "@/lib/db";
import { productCategories } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import {
  ProductCategoryCreateSchema,
  ProductCategoryUpdateSchema,
} from "@/lib/validation/link-in-bio";

// GET /api/link-in-bio/product-categories - Get all product categories
export async function GET() {
  try {
    // Product categories are public, but we still require authentication
    await getCurrentUser();

    const categories = await db
      .select()
      .from(productCategories)
      .where(eq(productCategories.isActive, true));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch product categories" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/product-categories - Create a new product category
export async function POST(request: Request) {
  try {
    // Only admins should be able to create categories - for now we'll skip user validation
    const json = await request.json();
    const parsed = ProductCategoryCreateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Create new category
    const newCategory = await db
      .insert(productCategories)
      .values({
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        isActive: body.isActive ?? true,
        sortOrder: body.sortOrder ?? 0,
      })
      .returning();

    return NextResponse.json(newCategory[0]);
  } catch (error) {
    console.error("Error creating product category:", error);
    return NextResponse.json(
      { error: "Failed to create product category" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/product-categories - Update a product category
export async function PUT(request: Request) {
  try {
    // Only admins should be able to update categories - for now we'll skip user validation
    const json = await request.json();
    const parsed = ProductCategoryUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const body = parsed.data;

    // Update category
    const updatedCategory = await db
      .update(productCategories)
      .set({
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      })
      .where(eq(productCategories.id, body.id))
      .returning();

    return NextResponse.json(updatedCategory[0]);
  } catch (error) {
    console.error("Error updating product category:", error);
    return NextResponse.json(
      { error: "Failed to update product category" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/product-categories - Delete a product category
export async function DELETE(request: Request) {
  try {
    // Only admins should be able to delete categories - for now we'll skip user validation
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("id");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Delete category
    await db
      .delete(productCategories)
      .where(eq(productCategories.id, categoryId));

    return NextResponse.json({
      message: "Product category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product category:", error);
    return NextResponse.json(
      { error: "Failed to delete product category" },
      { status: 500 }
    );
  }
}
