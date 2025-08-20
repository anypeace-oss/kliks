import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/link-in-bio/orders - Get all orders for the current user (as seller)
export async function GET() {
  try {
    const user = await getCurrentUser();
    
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.sellerId, user.id));
    
    return NextResponse.json(userOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/link-in-bio/orders - Create a new order
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    // Create new order
    const newOrder = await db
      .insert(orders)
      .values({
        orderNumber: body.orderNumber,
        customerId: body.customerId,
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        affiliateId: body.affiliateId,
        sellerId: user.id,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
        currency: body.currency || "IDR",
        status: body.status || "pending",
        paymentMethod: body.paymentMethod,
        paymentReference: body.paymentReference,
        paidAt: body.paidAt,
        expiresAt: body.expiresAt,
      })
      .returning();
    
    return NextResponse.json(newOrder[0]);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// PUT /api/link-in-bio/orders - Update an order
export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }
    
    // Check if order belongs to the current user
    const existingOrder = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, body.id),
          eq(orders.sellerId, user.id)
        )
      );
    
    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Update order
    const updatedOrder = await db
      .update(orders)
      .set({
        orderNumber: body.orderNumber,
        customerId: body.customerId,
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        affiliateId: body.affiliateId,
        subtotal: body.subtotal,
        tax: body.tax,
        total: body.total,
        currency: body.currency,
        status: body.status,
        paymentMethod: body.paymentMethod,
        paymentReference: body.paymentReference,
        paidAt: body.paidAt,
        expiresAt: body.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, body.id))
      .returning();
    
    return NextResponse.json(updatedOrder[0]);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE /api/link-in-bio/orders - Delete an order
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }
    
    // Check if order belongs to the current user
    const existingOrder = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, orderId),
          eq(orders.sellerId, user.id)
        )
      );
    
    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: "Order not found or unauthorized" },
        { status: 404 }
      );
    }
    
    // Delete order
    await db
      .delete(orders)
      .where(eq(orders.id, orderId));
    
    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    );
  }
}