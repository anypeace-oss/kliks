import { db } from "@/lib/db";
import { orderItems, orders } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/link-in-bio/order-items - Get all order items for the current user's orders
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    // First get all orders for the user
    const userOrders = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.sellerId, user.id));
    
    const orderIds = userOrders.map(order => order.id);
    
    if (orderIds.length === 0) {
      return NextResponse.json([]);
    }
    
    const orderItemsResult = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));
    
    return NextResponse.json(orderItemsResult);
  } catch (error) {
    console.error("Error fetching order items:", error);
    return NextResponse.json(
      { error: "Failed to fetch order items" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/order-items - Create a new order item
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    // Check if order belongs to the current user
    const order = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, body.orderId),
          eq(orders.sellerId, user.id)
        )
      );
    
    if (order.length === 0) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Create new order item
    const newOrderItem = await db
      .insert(orderItems)
      .values({
        orderId: body.orderId,
        productId: body.productId,
        productName: body.productName,
        productPrice: body.productPrice,
        quantity: body.quantity || 1,
        downloadCount: body.downloadCount || 0,
        downloadLimit: body.downloadLimit || 5,
        downloadExpiresAt: body.downloadExpiresAt,
      })
      .returning();
    
    return NextResponse.json(newOrderItem[0]);
  } catch (error) {
    console.error("Error creating order item:", error);
    return NextResponse.json(
      { error: "Failed to create order item" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/order-items - Update an order item
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Order item ID is required" },
        { status: 400 }
      );
    }
    
    // Check if order item belongs to the current user
    const existingOrderItem = await db
      .select()
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.id, body.id),
          eq(orders.sellerId, user.id)
        )
      );
    
    if (existingOrderItem.length === 0) {
      return NextResponse.json(
        { error: "Order item not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Update order item
    const updatedOrderItem = await db
      .update(orderItems)
      .set({
        orderId: body.orderId,
        productId: body.productId,
        productName: body.productName,
        productPrice: body.productPrice,
        quantity: body.quantity,
        downloadCount: body.downloadCount,
        downloadLimit: body.downloadLimit,
        downloadExpiresAt: body.downloadExpiresAt,
      })
      .where(eq(orderItems.id, body.id))
      .returning();
    
    return NextResponse.json(updatedOrderItem[0]);
  } catch (error) {
    console.error("Error updating order item:", error);
    return NextResponse.json(
      { error: "Failed to update order item" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/order-items - Delete an order item
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const orderItemId = searchParams.get("id");
    
    if (!orderItemId) {
      return NextResponse.json(
        { error: "Order item ID is required" },
        { status: 400 }
      );
    }
    
    // Check if order item belongs to the current user
    const existingOrderItem = await db
      .select()
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.id, orderItemId),
          eq(orders.sellerId, user.id)
        )
      );
    
    if (existingOrderItem.length === 0) {
      return NextResponse.json(
        { error: "Order item not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Delete order item
    await db
      .delete(orderItems)
      .where(eq(orderItems.id, orderItemId));
    
    return NextResponse.json({ message: "Order item deleted successfully" });
  } catch (error) {
    console.error("Error deleting order item:", error);
    return NextResponse.json(
      { error: "Failed to delete order item" },
      { status: 500 }
    );
  }
}