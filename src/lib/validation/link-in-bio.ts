import { z } from "zod";

// Reusable helpers
const decimalPattern = /^\d+(\.\d{1,2})?$/;
export const DecimalString = z
  .union([z.string(), z.number()])
  .transform((val) => (typeof val === "number" ? val.toString() : val))
  .refine((val) => decimalPattern.test(val), {
    message: "Must be a decimal number with up to 2 decimal places",
  });

export const UrlString = z.string().url({ message: "Must be a valid URL" });
export const OptionalUrlString = z
  .string()
  .url()
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

export const DateValue = z.coerce.date();
export const OptionalDateValue = z.coerce.date().optional();

// ===== Profiles =====
export const ProfileCreateSchema = z.object({
  username: z.string().min(3),
  displayName: z.string().min(1).optional(),
  bio: z.string().max(1000).optional(),
  avatar: OptionalUrlString,
  backgroundImage: OptionalUrlString,
  isPublic: z.boolean().optional(),
  analyticsEnabled: z.boolean().optional(),
  layoutTemplateId: z.string().optional(),
  colorSchemeId: z.string().optional(),
  customCss: z.string().optional(),
  socialLinks: z
    .object({
      instagram: z.string().optional(),
      tiktok: z.string().optional(),
      youtube: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      facebook: z.string().optional(),
      telegram: z.string().optional(),
      whatsapp: z.string().optional(),
    })
    .partial()
    .optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const ProfileUpdateSchema = ProfileCreateSchema.extend({
  id: z.string(),
});

// ===== Links =====
const ButtonStyleSchema = z
  .object({
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    borderRadius: z.string().optional(),
    border: z.string().optional(),
    animation: z.string().optional(),
  })
  .partial();

export const LinkCreateSchema = z
  .object({
    profileId: z.string(),
    title: z.string().min(1),
    url: OptionalUrlString,
    description: z.string().optional(),
    linkType: z
      .enum(["external", "product", "affiliate"])
      .optional()
      .default("external"),
    productId: z.string().optional(),
    affiliateId: z.string().optional(),
    icon: z.string().optional(),
    thumbnail: OptionalUrlString,
    buttonStyle: ButtonStyleSchema.optional(),
    isActive: z.boolean().optional(),
    openInNewTab: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    scheduledStart: OptionalDateValue,
    scheduledEnd: OptionalDateValue,
    clickLimit: z.number().int().positive().optional(),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.linkType === "external") return !!data.url;
      if (data.linkType === "product") return !!data.productId;
      if (data.linkType === "affiliate") return !!data.affiliateId;
      return true;
    },
    {
      message:
        "External requires url, product requires productId, affiliate requires affiliateId",
    }
  );

export const LinkUpdateSchema = LinkCreateSchema.extend({
  id: z.string(),
});

// ===== Product Categories =====
export const ProductCategoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const ProductCategoryUpdateSchema = ProductCategoryCreateSchema.extend({
  id: z.string(),
});

// ===== Digital Products =====
const FileSchema = z.object({
  name: z.string(),
  url: UrlString,
  size: z.number().int().nonnegative(),
  type: z.string(),
});

export const ProductCreateSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  thumbnail: OptionalUrlString,
  gallery: z.array(UrlString).optional(),
  previewFiles: z.array(UrlString).optional(),
  price: DecimalString,
  originalPrice: DecimalString.optional(),
  currency: z.string().optional().default("IDR"),
  files: z.array(FileSchema).optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  stock: z.number().int().positive().optional(),
  downloadLimit: z.number().int().positive().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.extend({
  id: z.string(),
});

// ===== Orders =====
export const OrderCreateSchema = z.object({
  orderNumber: z.string().min(1),
  customerId: z.string().optional(),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  affiliateId: z.string().optional(),
  subtotal: DecimalString,
  tax: DecimalString.optional(),
  total: DecimalString,
  currency: z.string().optional().default("IDR"),
  status: z
    .enum(["pending", "paid", "failed", "refunded"])
    .optional()
    .default("pending"),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  paidAt: OptionalDateValue,
  expiresAt: OptionalDateValue,
});

export const OrderUpdateSchema = OrderCreateSchema.extend({
  id: z.string(),
});

// ===== Order Items =====
export const OrderItemCreateSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  productName: z.string().min(1),
  productPrice: DecimalString,
  quantity: z.number().int().positive().optional().default(1),
  downloadCount: z.number().int().nonnegative().optional().default(0),
  downloadLimit: z.number().int().positive().optional().default(5),
  downloadExpiresAt: OptionalDateValue,
});

export const OrderItemUpdateSchema = OrderItemCreateSchema.extend({
  id: z.string(),
});

// ===== Subscriptions =====
export const SubscriptionCreateSchema = z.object({
  planId: z.string(),
  status: z.enum(["active", "canceled", "expired", "past_due"]),
  startDate: DateValue,
  endDate: DateValue,
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
});

export const SubscriptionUpdateSchema = SubscriptionCreateSchema.extend({
  id: z.string(),
});

// ===== Templates & Themes =====
const LayoutConfigSchema = z.object({
  layout: z.enum(["single-column", "two-column", "grid", "masonry"]),
  headerStyle: z.enum(["minimal", "centered", "full-width"]),
  buttonStyle: z.enum(["rounded", "square", "pill", "outlined"]),
  spacing: z.enum(["compact", "normal", "spacious"]),
});

export const TemplateLayoutCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  preview: OptionalUrlString,
  config: LayoutConfigSchema,
  isActive: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const TemplateLayoutUpdateSchema = TemplateLayoutCreateSchema.extend({
  id: z.string(),
});

export const ColorSchemeCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    background: z.string(),
    surface: z.string(),
    text: z.string(),
    textSecondary: z.string(),
    accent: z.string(),
    border: z.string(),
  }),
  preview: OptionalUrlString,
  isActive: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const ColorSchemeUpdateSchema = ColorSchemeCreateSchema.extend({
  id: z.string(),
});

// ===== Affiliates =====
export const AffiliateProgramCreateSchema = z.object({
  productId: z.string(),
  commissionType: z
    .enum(["percentage", "fixed"])
    .optional()
    .default("percentage"),
  commissionValue: DecimalString,
  isActive: z.boolean().optional(),
  requiresApproval: z.boolean().optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
});

export const AffiliateProgramUpdateSchema = AffiliateProgramCreateSchema.extend(
  {
    id: z.string(),
  }
);

export const AffiliateCreateSchema = z.object({
  affiliateProgramId: z.string(),
  affiliateUserId: z.string(),
  affiliateCode: z.string().min(1),
  status: z
    .enum(["pending", "approved", "rejected", "suspended"])
    .optional()
    .default("pending"),
});

export const AffiliateUpdateSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "approved", "rejected", "suspended"]),
  approvedAt: OptionalDateValue,
});

// ===== Analytics =====
export const LinkClickCreateSchema = z.object({
  linkId: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  referer: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  device: z.string().optional(),
  browser: z.string().optional(),
});

// Re-export types for frontend usage
export type ProfileCreateInput = z.infer<typeof ProfileCreateSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type LinkCreateInput = z.infer<typeof LinkCreateSchema>;
export type LinkUpdateInput = z.infer<typeof LinkUpdateSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ProductCategoryCreateInput = z.infer<
  typeof ProductCategoryCreateSchema
>;
export type ProductCategoryUpdateInput = z.infer<
  typeof ProductCategoryUpdateSchema
>;
export type OrderCreateInput = z.infer<typeof OrderCreateSchema>;
export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>;
export type OrderItemCreateInput = z.infer<typeof OrderItemCreateSchema>;
export type OrderItemUpdateInput = z.infer<typeof OrderItemUpdateSchema>;
export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateSchema>;
export type SubscriptionUpdateInput = z.infer<typeof SubscriptionUpdateSchema>;
export type TemplateLayoutCreateInput = z.infer<
  typeof TemplateLayoutCreateSchema
>;
export type TemplateLayoutUpdateInput = z.infer<
  typeof TemplateLayoutUpdateSchema
>;
export type ColorSchemeCreateInput = z.infer<typeof ColorSchemeCreateSchema>;
export type ColorSchemeUpdateInput = z.infer<typeof ColorSchemeUpdateSchema>;
export type AffiliateProgramCreateInput = z.infer<
  typeof AffiliateProgramCreateSchema
>;
export type AffiliateProgramUpdateInput = z.infer<
  typeof AffiliateProgramUpdateSchema
>;
export type AffiliateCreateInput = z.infer<typeof AffiliateCreateSchema>;
export type AffiliateUpdateInput = z.infer<typeof AffiliateUpdateSchema>;
export type LinkClickCreateInput = z.infer<typeof LinkClickCreateSchema>;
