import { db } from "@/lib/db";
import { digitalProducts, productCategories } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/link-in-bio/products - Get all products for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    const userProducts = await db
      .select()
      .from(digitalProducts)
      .where(eq(digitalProducts.userId, user.id));
    
    return NextResponse.json(userProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/products - Create a new product for the current user
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    // Create new product
    const newProduct = await db
      .insert(digitalProducts)
      .values({
        userId: user.id,
        categoryId: body.categoryId,
        name: body.name,
        slug: body.slug,
        description: body.description,
        shortDescription: body.shortDescription,
        thumbnail: body.thumbnail,
        gallery: body.gallery,
        previewFiles: body.previewFiles,
        price: body.price,
        originalPrice: body.originalPrice,
        currency: body.currency || "IDR",
        files: body.files,
        isActive: body.isActive ?? true,
        isPublic: body.isPublic ?? true,
        stock: body.stock,
        downloadLimit: body.downloadLimit,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
      })
      .returning();
    
    return NextResponse.json(newProduct[0]);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/products - Update a product for the current user
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Check if product belongs to the current user
    const existingProduct = await db
      .select()
      .from(digitalProducts)
      .where(
        and(
          eq(digitalProducts.id, body.id),
          eq(digitalProducts.userId, user.id)
        )
      );
    
    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Update product
    const updatedProduct = await db
      .update(digitalProducts)
      .set({
        categoryId: body.categoryId,
        name: body.name,
        slug: body.slug,
        description: body.description,
        shortDescription: body.shortDescription,
        thumbnail: body.thumbnail,
        gallery: body.gallery,
        previewFiles: body.previewFiles,
        price: body.price,
        originalPrice: body.originalPrice,
        currency: body.currency,
        files: body.files,
        isActive: body.isActive,
        isPublic: body.isPublic,
        stock: body.stock,
        downloadLimit: body.downloadLimit,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        updatedAt: new Date(),
      })
      .where(eq(digitalProducts.id, body.id))
      .returning();
    
    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/products - Delete a product for the current user
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Check if product belongs to the current user
    const existingProduct = await db
      .select()
      .from(digitalProducts)
      .where(
        and(
          eq(digitalProducts.id, productId),
          eq(digitalProducts.userId, user.id)
        )
      );
    
    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Delete product
    await db
      .delete(digitalProducts)
      .where(eq(digitalProducts.id, productId));
    
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}