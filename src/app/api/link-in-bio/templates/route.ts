import { db } from "@/lib/db";
import { layoutTemplates, colorSchemes } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/link-in-bio/templates - Get all templates (layout templates and color schemes)
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // layout, color, or all
    
    const result: any = {};
    
    if (type === "layout" || type === "all") {
      result.layoutTemplates = await db
        .select()
        .from(layoutTemplates)
        .where(eq(layoutTemplates.isActive, true));
    }
    
    if (type === "color" || type === "all") {
      result.colorSchemes = await db
        .select()
        .from(colorSchemes)
        .where(eq(colorSchemes.isActive, true));
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/templates/layout - Create a new layout template
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // layout or color
    
    if (type === "layout") {
      // Create new layout template
      const newLayout = await db
        .insert(layoutTemplates)
        .values({
          name: body.name,
          slug: body.slug,
          description: body.description,
          preview: body.preview,
          config: body.config,
          isActive: body.isActive ?? true,
          isPremium: body.isPremium ?? false,
          sortOrder: body.sortOrder ?? 0,
        })
        .returning();
      
      return NextResponse.json(newLayout[0]);
    } else if (type === "color") {
      // Create new color scheme
      const newColorScheme = await db
        .insert(colorSchemes)
        .values({
          name: body.name,
          slug: body.slug,
          colors: body.colors,
          preview: body.preview,
          isActive: body.isActive ?? true,
          isPremium: body.isPremium ?? false,
          sortOrder: body.sortOrder ?? 0,
        })
        .returning();
      
      return NextResponse.json(newColorScheme[0]);
    } else {
      return NextResponse.json(
        { error: "Template type is required (layout or color)" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/templates - Update a template
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // layout or color
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }
    
    if (type === "layout") {
      // Update layout template
      const updatedLayout = await db
        .update(layoutTemplates)
        .set({
          name: body.name,
          slug: body.slug,
          description: body.description,
          preview: body.preview,
          config: body.config,
          isActive: body.isActive,
          isPremium: body.isPremium,
          sortOrder: body.sortOrder,
        })
        .where(eq(layoutTemplates.id, body.id))
        .returning();
      
      return NextResponse.json(updatedLayout[0]);
    } else if (type === "color") {
      // Update color scheme
      const updatedColorScheme = await db
        .update(colorSchemes)
        .set({
          name: body.name,
          slug: body.slug,
          colors: body.colors,
          preview: body.preview,
          isActive: body.isActive,
          isPremium: body.isPremium,
          sortOrder: body.sortOrder,
        })
        .where(eq(colorSchemes.id, body.id))
        .returning();
      
      return NextResponse.json(updatedColorScheme[0]);
    } else {
      return NextResponse.json(
        { error: "Template type is required (layout or color)" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/templates - Delete a template
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("id");
    const type = searchParams.get("type"); // layout or color
    
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }
    
    if (type === "layout") {
      // Delete layout template
      await db
        .delete(layoutTemplates)
        .where(eq(layoutTemplates.id, templateId));
      
      return NextResponse.json({ message: "Layout template deleted successfully" });
    } else if (type === "color") {
      // Delete color scheme
      await db
        .delete(colorSchemes)
        .where(eq(colorSchemes.id, templateId));
      
      return NextResponse.json({ message: "Color scheme deleted successfully" });
    } else {
      return NextResponse.json(
        { error: "Template type is required (layout or color)" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}