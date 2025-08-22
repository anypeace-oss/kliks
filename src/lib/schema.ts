import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";

// ===== AUTH TABLES (from auth-schema.ts) =====
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ===== CORE LINK IN BIO TABLES =====

// Profile/Page utama user
export const profiles = pgTable("profiles", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  username: text("username").notNull().unique(), // untuk URL: /username
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatar: text("avatar"), // URL gambar
  backgroundImage: text("background_image"), // URL background

  // Template & Theme selection
  layoutTemplateId: text("layout_template_id").references(
    () => layoutTemplates.id,
    {
      onDelete: "set null",
    }
  ),
  colorSchemeId: text("color_scheme_id").references(() => colorSchemes.id, {
    onDelete: "set null",
  }),
  customCss: text("custom_css"), // untuk customization advanced

  isPublic: boolean("is_public").notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  // Analytics settings
  analyticsEnabled: boolean("analytics_enabled").notNull().default(true),

  // Social media links
  socialLinks: jsonb("social_links").$type<{
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    telegram?: string;
    whatsapp?: string;
    email?: string;
    github?: string;
  }>(),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Blocks/components on the profile (replaces links)
export const links = pgTable("links", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),

  // Common fields
  title: text("title").notNull(),
  url: text("url").notNull(), // for link
  isActive: boolean("is_active").notNull().default(true),
  // Ordering
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ===== DIGITAL PRODUCTS =====

// Kategori produk digital
export const productCategories = pgTable("product_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Produk digital
export const digitalProducts = pgTable("digital_products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: text("category_id").references(() => productCategories.id, {
    onDelete: "set null",
  }),

  // Basic info
  name: text("name").notNull(),
  slug: text("slug").notNull(), // untuk URL
  description: text("description"),
  shortDescription: text("short_description"),

  // Media
  thumbnail: text("thumbnail"), // gambar utama
  gallery: jsonb("gallery").$type<string[]>(), // array URL gambar
  previewFiles: jsonb("preview_files").$type<string[]>(), // file preview

  // Pricing
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }), // untuk discount
  currency: text("currency").notNull().default("IDR"),

  // Digital files
  files: jsonb("files").$type<
    Array<{
      name: string;
      url: string;
      size: number;
      type: string;
    }>
  >(), // file yang dibeli customer

  // Status & Settings
  isActive: boolean("is_active").notNull().default(true),
  isPublic: boolean("is_public").notNull().default(true),
  stock: integer("stock"), // null = unlimited
  downloadLimit: integer("download_limit").default(5), // berapa kali bisa download

  // SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  // Stats (denormalized untuk performance)
  totalSales: integer("total_sales").notNull().default(0),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ===== ORDERS & PAYMENTS =====

export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderNumber: text("order_number").notNull().unique(), // INV-001, dll

  // Customer info (bisa guest atau registered user)
  customerId: text("customer_id").references(() => user.id, {
    onDelete: "set null",
  }),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),

  // Tambah affiliate tracking ke orders
  affiliateId: text("affiliate_id").references(() => affiliates.id, {
    onDelete: "set null",
  }),
  sellerId: text("seller_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Order details
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("IDR"),

  // Status
  status: text("status").notNull().default("pending"), // pending, paid, failed, refunded
  paymentMethod: text("payment_method"), // midtrans, manual, dll
  paymentReference: text("payment_reference"), // ID dari payment gateway

  // Timestamps
  paidAt: timestamp("paid_at"),
  expiresAt: timestamp("expires_at"), // batas waktu pembayaran

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Item dalam order
export const orderItems = pgTable("order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => digitalProducts.id, { onDelete: "cascade" }),

  // Snapshot data (kalau produk berubah, order tetap konsisten)
  productName: text("product_name").notNull(),
  productPrice: decimal("product_price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),

  // Download tracking
  downloadCount: integer("download_count").notNull().default(0),
  downloadLimit: integer("download_limit").notNull().default(5),
  downloadExpiresAt: timestamp("download_expires_at"), // batas waktu download

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ===== ANALYTICS =====

// Click analytics untuk links/blocks
export const linkClicks = pgTable("link_clicks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  linkId: text("link_id")
    .notNull()
    .references(() => links.id, { onDelete: "cascade" }),

  // Visitor info
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  country: text("country"),
  city: text("city"),
  device: text("device"), // mobile, desktop, tablet
  browser: text("browser"),

  clickedAt: timestamp("clicked_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Profile views
export const profileViews = pgTable("profile_views", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),

  // Visitor info
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),
  country: text("country"),
  city: text("city"),
  device: text("device"),
  browser: text("browser"),

  viewedAt: timestamp("viewed_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ===== TEMPLATES & THEMES =====

// Layout template yang bisa dipilih user
export const layoutTemplates = pgTable("layout_templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  preview: text("preview"), // URL screenshot template

  // Template config (layout structure)
  config: jsonb("config").$type<{
    layout: "single-column" | "two-column" | "grid" | "masonry";
    headerStyle: "minimal" | "centered" | "full-width";
    buttonStyle: "rounded" | "square" | "pill" | "outlined";
    spacing: "compact" | "normal" | "spacious";
  }>(),

  isActive: boolean("is_active").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Color schemes/themes
export const colorSchemes = pgTable("color_schemes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),

  // Color palette
  colors: jsonb("colors").$type<{
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    accent: string;
    border: string;
  }>(),

  preview: text("preview"), // URL preview image
  isActive: boolean("is_active").notNull().default(true),
  isPremium: boolean("is_premium").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ===== AFFILIATES SYSTEM =====

// Program affiliate untuk setiap produk
export const affiliatePrograms = pgTable("affiliate_programs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => digitalProducts.id, { onDelete: "cascade" }),

  // Commission settings
  commissionType: text("commission_type").notNull().default("percentage"), // percentage, fixed
  commissionValue: decimal("commission_value", {
    precision: 8,
    scale: 2,
  }).notNull(),

  // Program status
  isActive: boolean("is_active").notNull().default(true),
  requiresApproval: boolean("requires_approval").notNull().default(false),

  // Terms
  description: text("description"),
  terms: text("terms"),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Affiliate relationships (siapa yang jadi affiliate dari produk apa)
export const affiliates = pgTable("affiliates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  affiliateProgramId: text("affiliate_program_id")
    .notNull()
    .references(() => affiliatePrograms.id, { onDelete: "cascade" }),
  affiliateUserId: text("affiliate_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Unique affiliate code untuk tracking
  affiliateCode: text("affiliate_code").notNull().unique(),

  // Status
  status: text("status").notNull().default("pending"), // pending, approved, rejected, suspended

  // Stats (denormalized)
  totalClicks: integer("total_clicks").notNull().default(0),
  totalSales: integer("total_sales").notNull().default(0),
  totalCommission: decimal("total_commission", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),

  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Tracking affiliate clicks
export const affiliateClicks = pgTable("affiliate_clicks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  affiliateId: text("affiliate_id")
    .notNull()
    .references(() => affiliates.id, { onDelete: "cascade" }),

  // Visitor tracking
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referer: text("referer"),

  clickedAt: timestamp("clicked_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// Commission dari penjualan affiliate
export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  affiliateId: text("affiliate_id")
    .notNull()
    .references(() => affiliates.id, { onDelete: "cascade" }),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),

  // Commission details
  saleAmount: decimal("sale_amount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: decimal("commission_amount", {
    precision: 10,
    scale: 2,
  }).notNull(),
  commissionRate: decimal("commission_rate", {
    precision: 5,
    scale: 2,
  }).notNull(),

  // Status
  status: text("status").notNull().default("pending"), // pending, approved, paid

  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ===== SUBSCRIPTIONS (untuk future monetization) =====

export const subscriptionPlans = pgTable("subscription_plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("IDR"),
  interval: text("interval").notNull(), // monthly, yearly

  // Features (bisa juga pakai relation table terpisah)
  features: jsonb("features").$type<{
    maxLinks: number;
    maxProducts: number;
    customDomain: boolean;
    analytics: boolean;
    customCSS: boolean;
    removeWatermark: boolean;
  }>(),

  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  planId: text("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id, { onDelete: "cascade" }),

  status: text("status").notNull(), // active, canceled, expired, past_due
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),

  // Payment info
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),

  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

// ===== RELATIONS =====

// Export relations untuk Drizzle ORM
export const userRelations = {
  profiles: {
    relation: "one-to-many",
    table: profiles,
    reference: "userId",
  },
  digitalProducts: {
    relation: "one-to-many",
    table: digitalProducts,
    reference: "userId",
  },
  orders: {
    relation: "one-to-many",
    table: orders,
    reference: "sellerId",
  },
};

export const profileRelations = {
  user: {
    relation: "many-to-one",
    table: user,
    reference: "userId",
  },
  blocks: {
    relation: "one-to-many",
    table: links,
    reference: "profileId",
  },
};

export const digitalProductRelations = {
  user: {
    relation: "many-to-one",
    table: user,
    reference: "userId",
  },
  category: {
    relation: "many-to-one",
    table: productCategories,
    reference: "categoryId",
  },
};
