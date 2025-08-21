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
  TemplateLayoutCreateInput,
  TemplateLayoutUpdateInput,
  ColorSchemeCreateInput,
  ColorSchemeUpdateInput,
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
  return res.data as any[];
}

export async function createProfile(input: ProfileCreateInput) {
  const res = await api.post("/api/link-in-bio/profiles", input);
  return res.data as any;
}

export async function updateProfile(input: ProfileUpdateInput) {
  const res = await api.put("/api/link-in-bio/profiles", input);
  return res.data as any;
}

export async function deleteProfile(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/profiles?id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Templates (for profile fields) =====
export async function getTemplates(type: "layout" | "color" | "all" = "all") {
  const res = await api.get(`/api/link-in-bio/templates?type=${type}`);
  return res.data as { layoutTemplates?: any[]; colorSchemes?: any[] };
}

export async function getLayoutTemplates() {
  const res = await api.get(`/api/link-in-bio/templates?type=layout`);
  return (res.data?.layoutTemplates ?? []) as any[];
}

export async function getColorSchemes() {
  const res = await api.get(`/api/link-in-bio/templates?type=color`);
  return (res.data?.colorSchemes ?? []) as any[];
}

// ===== Links =====
export async function getLinks() {
  const res = await api.get("/api/link-in-bio/links");
  return res.data as any[];
}

export async function createLink(input: LinkCreateInput) {
  const res = await api.post("/api/link-in-bio/links", input);
  return res.data as any;
}

export async function updateLink(input: LinkUpdateInput) {
  const res = await api.put("/api/link-in-bio/links", input);
  return res.data as any;
}

export async function deleteLink(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/links?id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Product Categories =====
export async function getProductCategories() {
  const res = await api.get("/api/link-in-bio/product-categories");
  return res.data as any[];
}

export async function createProductCategory(input: ProductCategoryCreateInput) {
  const res = await api.post("/api/link-in-bio/product-categories", input);
  return res.data as any;
}

export async function updateProductCategory(input: ProductCategoryUpdateInput) {
  const res = await api.put("/api/link-in-bio/product-categories", input);
  return res.data as any;
}

export async function deleteProductCategory(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/product-categories?id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Products =====
export async function getProducts() {
  const res = await api.get("/api/link-in-bio/products");
  return res.data as any[];
}

export async function createProduct(input: ProductCreateInput) {
  const res = await api.post("/api/link-in-bio/products", input);
  return res.data as any;
}

export async function updateProduct(input: ProductUpdateInput) {
  const res = await api.put("/api/link-in-bio/products", input);
  return res.data as any;
}

export async function deleteProduct(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/products?id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Orders =====
export async function getOrders() {
  const res = await api.get("/api/link-in-bio/orders");
  return res.data as any[];
}

export async function createOrder(input: OrderCreateInput) {
  const res = await api.post("/api/link-in-bio/orders", input);
  return res.data as any;
}

export async function updateOrder(input: OrderUpdateInput) {
  const res = await api.put("/api/link-in-bio/orders", input);
  return res.data as any;
}

export async function deleteOrder(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/orders?id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Order Items =====
export async function getOrderItems() {
  const res = await api.get("/api/link-in-bio/order-items");
  return res.data as any[];
}

export async function createOrderItem(input: OrderItemCreateInput) {
  const res = await api.post("/api/link-in-bio/order-items", input);
  return res.data as any;
}

export async function updateOrderItem(input: OrderItemUpdateInput) {
  const res = await api.put("/api/link-in-bio/order-items", input);
  return res.data as any;
}

export async function deleteOrderItem(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/order-items?id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Subscriptions =====
export async function getSubscriptionData(
  type: "plans" | "subscriptions" | "all" = "all"
) {
  const res = await api.get(`/api/link-in-bio/subscriptions?type=${type}`);
  return res.data as { subscriptionPlans?: any[]; userSubscriptions?: any[] };
}

export async function createSubscription(input: SubscriptionCreateInput) {
  const res = await api.post(
    `/api/link-in-bio/subscriptions?type=subscription`,
    input
  );
  return res.data as any;
}

export async function updateSubscription(input: SubscriptionUpdateInput) {
  const res = await api.put(`/api/link-in-bio/subscriptions`, input);
  return res.data as any;
}

export async function deleteSubscription(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/subscriptions?id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Templates Management =====
export async function createLayoutTemplate(input: TemplateLayoutCreateInput) {
  const res = await api.post(`/api/link-in-bio/templates?type=layout`, input);
  return res.data as any;
}

export async function updateLayoutTemplate(input: TemplateLayoutUpdateInput) {
  const res = await api.put(`/api/link-in-bio/templates?type=layout`, input);
  return res.data as any;
}

export async function deleteLayoutTemplate(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/templates?type=layout&id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

export async function createColorScheme(input: ColorSchemeCreateInput) {
  const res = await api.post(`/api/link-in-bio/templates?type=color`, input);
  return res.data as any;
}

export async function updateColorScheme(input: ColorSchemeUpdateInput) {
  const res = await api.put(`/api/link-in-bio/templates?type=color`, input);
  return res.data as any;
}

export async function deleteColorScheme(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/templates?type=color&id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Affiliates =====
export async function getAffiliateData(
  type: "programs" | "affiliates" | "commissions" | "all" = "all"
) {
  const res = await api.get(`/api/link-in-bio/affiliates?type=${type}`);
  return res.data as any;
}

export async function createAffiliateProgram(
  input: AffiliateProgramCreateInput
) {
  const res = await api.post(`/api/link-in-bio/affiliates?type=program`, input);
  return res.data as any;
}

export async function updateAffiliateProgram(
  input: AffiliateProgramUpdateInput
) {
  const res = await api.put(`/api/link-in-bio/affiliates?type=program`, input);
  return res.data as any;
}

export async function deleteAffiliateProgram(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/affiliates?type=program&id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

export async function createAffiliate(input: AffiliateCreateInput) {
  const res = await api.post(
    `/api/link-in-bio/affiliates?type=affiliate`,
    input
  );
  return res.data as any;
}

export async function updateAffiliate(input: AffiliateUpdateInput) {
  const res = await api.put(
    `/api/link-in-bio/affiliates?type=affiliate`,
    input
  );
  return res.data as any;
}

export async function deleteAffiliate(id: string) {
  const res = await api.delete(
    `/api/link-in-bio/affiliates?type=affiliate&id=${encodeURIComponent(id)}`
  );
  return res.data as any;
}

// ===== Analytics (read-only in studio) =====
export async function getAnalytics(
  type: "link-clicks" | "profile-views" | "all" = "all",
  limit = 100
) {
  const res = await api.get(
    `/api/link-in-bio/analytics?type=${type}&limit=${limit}`
  );
  return res.data as any;
}
