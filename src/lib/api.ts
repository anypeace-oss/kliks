import axios from "axios";
import type {
  ProfileCreateInput,
  ProfileUpdateInput,
  LinkCreateInput,
  LinkUpdateInput,
  ProductCategoryCreateInput,
  ProductCategoryUpdateInput,
  ProductCreateInput,
  ProductUpdateInput,
  OrderCreateInput,
  OrderUpdateInput,
  OrderItemCreateInput,
  OrderItemUpdateInput,
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
  AffiliateProgramCreateInput,
  AffiliateProgramUpdateInput,
  AffiliateCreateInput,
  AffiliateUpdateInput,
} from "@/lib/validation/link-in-bio";

export const api = axios.create({
  baseURL: "/",
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== Profiles =====
export async function getProfiles() {
  const res = await api.get("/api/link-in-bio/profiles");
  return res.data as unknown[];
}

export async function createProfile(input: ProfileCreateInput) {
  const res = await api.post("/api/link-in-bio/profiles", input);
  return res.data as unknown;
}

export async function updateProfile(input: ProfileUpdateInput) {
  const res = await api.put("/api/link-in-bio/profiles", input);
  return res.data as unknown;
}

export async function deleteProfile(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/profiles?id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

// ===== Links =====
export async function getLinks() {
  const res = await api.get("/api/link-in-bio/links");
  return res.data as unknown[];
}

export async function createLink(input: LinkCreateInput) {
  const res = await api.post("/api/link-in-bio/links", input);
  return res.data as unknown;
}

export async function updateLink(input: LinkUpdateInput) {
  const res = await api.put("/api/link-in-bio/links", input);
  return res.data as unknown;
}

export async function deleteLink(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/links?id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

// ===== Product Categories =====
export async function getProductCategories() {
  const res = await api.get("/api/link-in-bio/product-categories");
  return res.data as Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: string;
  }>;
}

export async function createProductCategory(input: ProductCategoryCreateInput) {
  const res = await api.post("/api/link-in-bio/product-categories", input);
  return res.data as unknown;
}

export async function updateProductCategory(input: ProductCategoryUpdateInput) {
  const res = await api.put("/api/link-in-bio/product-categories", input);
  return res.data as unknown;
}

export async function deleteProductCategory(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/product-categories?id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

// ===== Products =====
export async function getProducts() {
  const res = await api.get("/api/link-in-bio/products");
  return res.data as Array<{
    id: string;
    userId: string;
    categoryId: string | null;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    thumbnail: string | null;
    gallery: string[] | null;
    previewFiles: string[] | null;
    price: string;
    originalPrice: string | null;
    currency: string;
    files: Array<{
      name: string;
      url: string;
      size: number;
      type: string;
    }> | null;
    isActive: boolean;
    isPublic: boolean;
    stock: number | null;
    downloadLimit: number | null;
    seoTitle: string | null;
    seoDescription: string | null;
    totalSales: number;
    totalRevenue: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export async function createProduct(input: ProductCreateInput) {
  const res = await api.post("/api/link-in-bio/products", input);
  return res.data as unknown;
}

export async function updateProduct(input: ProductUpdateInput) {
  const res = await api.put("/api/link-in-bio/products", input);
  return res.data as unknown;
}

export async function deleteProduct(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/products?id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

// ===== Orders =====
export async function getOrders() {
  const res = await api.get("/api/link-in-bio/orders");
  return res.data as Array<{
    id: string;
    orderNumber: string;
    customerId: string | null;
    customerEmail: string;
    customerName: string;
    customerPhone: string | null;
    affiliateId: string | null;
    sellerId: string;
    subtotal: string;
    tax: string;
    total: string;
    currency: string;
    status: string;
    paymentMethod: string | null;
    paymentReference: string | null;
    paidAt: string | null;
    expiresAt: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
}

export async function createOrder(input: OrderCreateInput) {
  const res = await api.post("/api/link-in-bio/orders", input);
  return res.data as unknown;
}

export async function updateOrder(input: OrderUpdateInput) {
  const res = await api.put("/api/link-in-bio/orders", input);
  return res.data as unknown;
}

export async function deleteOrder(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/orders?id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

// ===== Order Items =====
export async function getOrderItems() {
  const res = await api.get("/api/link-in-bio/order-items");
  return res.data as Array<{
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    productPrice: string;
    quantity: number;
    downloadCount: number;
    downloadLimit: number;
    downloadExpiresAt: string | null;
    createdAt: string;
  }>;
}

export async function createOrderItem(input: OrderItemCreateInput) {
  const res = await api.post("/api/link-in-bio/order-items", input);
  return res.data as unknown;
}

export async function updateOrderItem(input: OrderItemUpdateInput) {
  const res = await api.put("/api/link-in-bio/order-items", input);
  return res.data as unknown;
}

export async function deleteOrderItem(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/order-items?id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

// ===== Subscriptions =====
export async function getSubscriptionData(
  type: "plans" | "subscriptions" | "all" = "all"
) {
  const res = await api.get(`/api/link-in-bio/subscriptions?type=${type}`);
  return res.data as {
    subscriptionPlans?: unknown[];
    userSubscriptions?: unknown[];
  };
}

export async function createSubscription(input: SubscriptionCreateInput) {
  const res = await api.post(
    `/api/link-in-bio/subscriptions?type=subscription`,
    input
  );
  return res.data as unknown;
}

export async function updateSubscription(input: SubscriptionUpdateInput) {
  const res = await api.put(`/api/link-in-bio/subscriptions`, input);
  return res.data as unknown;
}

export async function deleteSubscription(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/subscriptions?id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

// ===== Affiliates =====
export async function getAffiliateData(
  type: "programs" | "affiliates" | "commissions" | "all" = "all"
) {
  const res = await api.get(`/api/link-in-bio/affiliates?type=${type}`);
  return res.data as unknown;
}

export async function createAffiliateProgram(
  input: AffiliateProgramCreateInput
) {
  const res = await api.post(`/api/link-in-bio/affiliates?type=program`, input);
  return res.data as unknown;
}

export async function updateAffiliateProgram(
  input: AffiliateProgramUpdateInput
) {
  const res = await api.put(`/api/link-in-bio/affiliates?type=program`, input);
  return res.data as unknown;
}

export async function deleteAffiliateProgram(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/affiliates?type=program&id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

export async function createAffiliate(input: AffiliateCreateInput) {
  const res = await api.post(
    `/api/link-in-bio/affiliates?type=affiliate`,
    input
  );
  return res.data as unknown;
}

export async function updateAffiliate(input: AffiliateUpdateInput) {
  const res = await api.put(
    `/api/link-in-bio/affiliates?type=affiliate`,
    input
  );
  return res.data as unknown;
}

export async function deleteAffiliate(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/affiliates?type=affiliate&id=${encodeURIComponent(id)}`
  );
  return res.data as unknown;
}

// ===== Analytics (read-only in studio) =====
export async function getAnalytics(
  type: "link-clicks" | "profile-views" | "all" = "all",
  limit = 100
) {
  const res = await api.get(
    `/api/link-in-bio/analytics?type=${type}&limit=${limit}`
  );
  return res.data as unknown;
}
