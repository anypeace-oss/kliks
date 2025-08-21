"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderItems,
  createOrderItem,
  updateOrderItem,
  deleteOrderItem,
  getProducts,
} from "@/lib/api";
import type {
  OrderCreateInput,
  OrderUpdateInput,
  OrderItemCreateInput,
  OrderItemUpdateInput,
} from "@/lib/validation/link-in-bio";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type definitions for orders page
interface Order {
  id: string;
  orderNumber: string;
  customerId: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone: string | null;
  affiliateId: string | null;
  sellerId: string;
  subtotal: string | number;
  tax: string | number;
  total: string | number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  paymentReference: string | null;
  paidAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productPrice: string | number;
  quantity: number;
  downloadCount: number;
  downloadLimit: number;
  downloadExpiresAt: string | null;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: string | number;
  [key: string]: unknown;
}

export default function OrdersAndItemsStudioPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderForm = useForm<OrderCreateInput | OrderUpdateInput>({
    defaultValues: {
      orderNumber: "",
      customerId: "",
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      affiliateId: "",
      subtotal: "0",
      tax: "0",
      total: "0",
      currency: "IDR",
      status: "pending",
      paymentMethod: "",
      paymentReference: "",
      paidAt: undefined,
      expiresAt: undefined,
    },
  });
  const orderEditing = useMemo(() => !!selectedOrderId, [selectedOrderId]);

  const itemForm = useForm<OrderItemCreateInput | OrderItemUpdateInput>({
    defaultValues: {
      orderId: "",
      productId: "",
      productName: "",
      productPrice: "0",
      quantity: 1,
      downloadCount: 0,
      downloadLimit: 5,
      downloadExpiresAt: undefined,
    },
  });
  const itemEditing = useMemo(
    () => !!selectedOrderItemId,
    [selectedOrderItemId]
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [os, its, ps] = await Promise.all([
        getOrders(),
        getOrderItems(),
        getProducts(),
      ]);
      setOrders(os);
      setOrderItems(its);
      setProducts(ps);
      if (os.length && !selectedOrderId) setSelectedOrderId(os[0].id);
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error &&
        "response" in e &&
        typeof e.response === "object" &&
        e.response &&
        "data" in e.response &&
        typeof e.response.data === "object" &&
        e.response.data &&
        "error" in e.response.data &&
        typeof e.response.data.error === "string"
          ? e.response.data.error
          : e instanceof Error
          ? e.message
          : "Failed to load";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Order handlers
  function onNewOrder() {
    setSelectedOrderId(null);
    orderForm.reset({
      orderNumber: "",
      customerId: "",
      customerEmail: "",
      customerName: "",
      customerPhone: "",
      affiliateId: "",
      subtotal: "0",
      tax: "0",
      total: "0",
      currency: "IDR",
      status: "pending",
      paymentMethod: "",
      paymentReference: "",
      paidAt: undefined,
      expiresAt: undefined,
    });
  }

  function onPickOrder(o: Order) {
    setSelectedOrderId(o.id);
    orderForm.reset({
      id: o.id,
      orderNumber: o.orderNumber || "",
      customerId: o.customerId || "",
      customerEmail: o.customerEmail || "",
      customerName: o.customerName || "",
      customerPhone: o.customerPhone || "",
      affiliateId: o.affiliateId || "",
      subtotal: o.subtotal?.toString?.() || String(o.subtotal || "0"),
      tax: o.tax?.toString?.() || "0",
      total: o.total?.toString?.() || String(o.total || "0"),
      currency: o.currency || "IDR",
      status:
        o.status === "pending" ||
        o.status === "paid" ||
        o.status === "failed" ||
        o.status === "refunded"
          ? o.status
          : "pending",
      paymentMethod: o.paymentMethod || "",
      paymentReference: o.paymentReference || "",
      paidAt: o.paidAt ? new Date(o.paidAt) : undefined,
      expiresAt: o.expiresAt ? new Date(o.expiresAt) : undefined,
    });
  }

  async function onSubmitOrder(values: OrderCreateInput | OrderUpdateInput) {
    setLoading(true);
    setError(null);
    try {
      if (orderEditing) {
        await updateOrder({
          ...(values as OrderUpdateInput),
          id: selectedOrderId as string,
        });
      } else {
        await createOrder(values as OrderCreateInput);
      }
      await refresh();
      onNewOrder();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error &&
        "response" in e &&
        typeof e.response === "object" &&
        e.response &&
        "data" in e.response &&
        typeof e.response.data === "object" &&
        e.response.data &&
        "error" in e.response.data &&
        typeof e.response.data.error === "string"
          ? e.response.data.error
          : e instanceof Error
          ? e.message
          : "Failed to save order";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteOrder(id: string) {
    setLoading(true);
    setError(null);
    try {
      await deleteOrder(id);
      await refresh();
      if (selectedOrderId === id) onNewOrder();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error &&
        "response" in e &&
        typeof e.response === "object" &&
        e.response &&
        "data" in e.response &&
        typeof e.response.data === "object" &&
        e.response.data &&
        "error" in e.response.data &&
        typeof e.response.data.error === "string"
          ? e.response.data.error
          : e instanceof Error
          ? e.message
          : "Failed to delete order";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // Order item handlers
  function onNewItem() {
    setSelectedOrderItemId(null);
    itemForm.reset({
      orderId: selectedOrderId || "",
      productId: "",
      productName: "",
      productPrice: "0",
      quantity: 1,
      downloadCount: 0,
      downloadLimit: 5,
      downloadExpiresAt: undefined,
    });
  }

  function onPickItem(it: OrderItem) {
    setSelectedOrderItemId(it.id);
    itemForm.reset({
      id: it.id,
      orderId: it.orderId || selectedOrderId || "",
      productId: it.productId || "",
      productName: it.productName || "",
      productPrice:
        it.productPrice?.toString?.() || String(it.productPrice || "0"),
      quantity: it.quantity ?? 1,
      downloadCount: it.downloadCount ?? 0,
      downloadLimit: it.downloadLimit ?? 5,
      downloadExpiresAt: it.downloadExpiresAt
        ? new Date(it.downloadExpiresAt)
        : undefined,
    });
  }

  function fillFromProduct(pid: string) {
    const p = products.find((x) => x.id === pid);
    if (p) {
      itemForm.setValue("productName", p.name || "");
      itemForm.setValue(
        "productPrice",
        p.price?.toString?.() || String(p.price || "0")
      );
    }
  }

  async function onSubmitItem(
    values: OrderItemCreateInput | OrderItemUpdateInput
  ) {
    setLoading(true);
    setError(null);
    try {
      if (itemEditing) {
        await updateOrderItem({
          ...(values as OrderItemUpdateInput),
          id: selectedOrderItemId as string,
        });
      } else {
        await createOrderItem(values as OrderItemCreateInput);
      }
      await refresh();
      onNewItem();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error &&
        "response" in e &&
        typeof e.response === "object" &&
        e.response &&
        "data" in e.response &&
        typeof e.response.data === "object" &&
        e.response.data &&
        "error" in e.response.data &&
        typeof e.response.data.error === "string"
          ? e.response.data.error
          : e instanceof Error
          ? e.message
          : "Failed to save item";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteItem(id: string) {
    setLoading(true);
    setError(null);
    try {
      await deleteOrderItem(id);
      await refresh();
      if (selectedOrderItemId === id) onNewItem();
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error &&
        "response" in e &&
        typeof e.response === "object" &&
        e.response &&
        "data" in e.response &&
        typeof e.response.data === "object" &&
        e.response.data &&
        "error" in e.response.data &&
        typeof e.response.data.error === "string"
          ? e.response.data.error
          : e instanceof Error
          ? e.message
          : "Failed to delete item";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const itemsForSelectedOrder = orderItems.filter(
    (it) => it.orderId === selectedOrderId
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Studio • Orders & Order Items</h2>
        <Button variant="outline" onClick={refresh} disabled={loading}>
          Refresh
        </Button>
      </div>
      {error ? <div className="text-red-500 text-sm">{error}</div> : null}

      <Tabs defaultValue="orders" className="w-full">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="items">Order Items</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={onNewOrder}
                  variant="outline"
                  className="w-full"
                >
                  New Order
                </Button>
                <Separator />
                <div className="space-y-2 max-h-[440px] overflow-auto">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">{o.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.customerName} • {String(o.total)} {o.currency}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPickOrder(o)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteOrder(o.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {orderEditing ? "Edit Order" : "Create Order"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={orderForm.handleSubmit(onSubmitOrder)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <Label>Order Number</Label>
                    <Input
                      {...orderForm.register("orderNumber", { required: true })}
                    />
                  </div>
                  <div>
                    <Label>Customer ID</Label>
                    <Input {...orderForm.register("customerId")} />
                  </div>
                  <div>
                    <Label>Customer Email</Label>
                    <Input
                      {...orderForm.register("customerEmail", {
                        required: true,
                      })}
                    />
                  </div>
                  <div>
                    <Label>Customer Name</Label>
                    <Input
                      {...orderForm.register("customerName", {
                        required: true,
                      })}
                    />
                  </div>
                  <div>
                    <Label>Customer Phone</Label>
                    <Input {...orderForm.register("customerPhone")} />
                  </div>
                  <div>
                    <Label>Affiliate ID</Label>
                    <Input {...orderForm.register("affiliateId")} />
                  </div>

                  <div>
                    <Label>Subtotal</Label>
                    <Input {...orderForm.register("subtotal")} />
                  </div>
                  <div>
                    <Label>Tax</Label>
                    <Input {...orderForm.register("tax")} />
                  </div>
                  <div>
                    <Label>Total</Label>
                    <Input {...orderForm.register("total")} />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input {...orderForm.register("currency")} />
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select
                      value={orderForm.watch("status") || "pending"}
                      onValueChange={(v) =>
                        orderForm.setValue(
                          "status",
                          v as "pending" | "paid" | "failed" | "refunded"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">pending</SelectItem>
                        <SelectItem value="paid">paid</SelectItem>
                        <SelectItem value="failed">failed</SelectItem>
                        <SelectItem value="refunded">refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Payment Method</Label>
                    <Input {...orderForm.register("paymentMethod")} />
                  </div>
                  <div>
                    <Label>Payment Reference</Label>
                    <Input {...orderForm.register("paymentReference")} />
                  </div>
                  <div>
                    <Label>Paid At</Label>
                    <Input
                      type="datetime-local"
                      {...orderForm.register("paidAt")}
                    />
                  </div>
                  <div>
                    <Label>Expires At</Label>
                    <Input
                      type="datetime-local"
                      {...orderForm.register("expiresAt")}
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <Button type="submit" disabled={loading}>
                      {orderEditing ? "Update" : "Create"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onNewOrder}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Items for selected Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Selected Order: {selectedOrderId || "(none)"}
                </div>
                <Button
                  onClick={onNewItem}
                  variant="outline"
                  className="w-full"
                >
                  New Item
                </Button>
                <Separator />
                <div className="space-y-2 max-h-[440px] overflow-auto">
                  {itemsForSelectedOrder.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="flex flex-col">
                        <div className="font-medium">{it.productName}</div>
                        <div className="text-xs text-muted-foreground">
                          x{it.quantity} • {String(it.productPrice)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onPickItem(it)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteItem(it.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {itemEditing ? "Edit Item" : "Create Item"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={itemForm.handleSubmit(onSubmitItem)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="col-span-2">
                    <Label>Order</Label>
                    <Select
                      value={itemForm.watch("orderId") || selectedOrderId || ""}
                      onValueChange={(v) => itemForm.setValue("orderId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Select order</SelectItem>
                        {orders.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.orderNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label>Product</Label>
                    <Select
                      value={itemForm.watch("productId") || ""}
                      onValueChange={(v) => {
                        itemForm.setValue("productId", v);
                        fillFromProduct(v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Select product</SelectItem>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Product Name</Label>
                    <Input
                      {...itemForm.register("productName", { required: true })}
                    />
                  </div>
                  <div>
                    <Label>Product Price</Label>
                    <Input
                      {...itemForm.register("productPrice", { required: true })}
                    />
                  </div>

                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      {...itemForm.register("quantity", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div>
                    <Label>Download Count</Label>
                    <Input
                      type="number"
                      {...itemForm.register("downloadCount", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div>
                    <Label>Download Limit</Label>
                    <Input
                      type="number"
                      {...itemForm.register("downloadLimit", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div>
                    <Label>Download Expires At</Label>
                    <Input
                      type="datetime-local"
                      {...itemForm.register("downloadExpiresAt")}
                    />
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    <Button type="submit" disabled={loading}>
                      {itemEditing ? "Update" : "Create"}
                    </Button>
                    <Button type="button" variant="outline" onClick={onNewItem}>
                      Reset
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
