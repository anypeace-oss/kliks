import { registry } from "./registry";
import {
  ProfileCreateSchema,
  ProfileUpdateSchema,
  LinkCreateSchema,
  LinkUpdateSchema,
  ProductCategoryCreateSchema,
  ProductCategoryUpdateSchema,
  ProductCreateSchema,
  ProductUpdateSchema,
  OrderCreateSchema,
  OrderUpdateSchema,
  OrderItemCreateSchema,
  OrderItemUpdateSchema,
  SubscriptionCreateSchema,
  SubscriptionUpdateSchema,
  TemplateLayoutCreateSchema,
  TemplateLayoutUpdateSchema,
  ColorSchemeCreateSchema,
  ColorSchemeUpdateSchema,
  AffiliateProgramCreateSchema,
  AffiliateProgramUpdateSchema,
  AffiliateCreateSchema,
  AffiliateUpdateSchema,
  LinkClickCreateSchema,
} from "@/lib/validation/link-in-bio";

// Register schemas with stable names in components.schemas
export const OpenAPIProfileCreate = registry.register(
  "ProfileCreate",
  ProfileCreateSchema
);
export const OpenAPIProfileUpdate = registry.register(
  "ProfileUpdate",
  ProfileUpdateSchema
);

export const OpenAPILinkCreate = registry.register(
  "LinkCreate",
  LinkCreateSchema
);
export const OpenAPILinkUpdate = registry.register(
  "LinkUpdate",
  LinkUpdateSchema
);

export const OpenAPIProductCategoryCreate = registry.register(
  "ProductCategoryCreate",
  ProductCategoryCreateSchema
);
export const OpenAPIProductCategoryUpdate = registry.register(
  "ProductCategoryUpdate",
  ProductCategoryUpdateSchema
);

export const OpenAPIProductCreate = registry.register(
  "ProductCreate",
  ProductCreateSchema
);
export const OpenAPIProductUpdate = registry.register(
  "ProductUpdate",
  ProductUpdateSchema
);

export const OpenAPIOrderCreate = registry.register(
  "OrderCreate",
  OrderCreateSchema
);
export const OpenAPIOrderUpdate = registry.register(
  "OrderUpdate",
  OrderUpdateSchema
);

export const OpenAPIOrderItemCreate = registry.register(
  "OrderItemCreate",
  OrderItemCreateSchema
);
export const OpenAPIOrderItemUpdate = registry.register(
  "OrderItemUpdate",
  OrderItemUpdateSchema
);

export const OpenAPISubscriptionCreate = registry.register(
  "SubscriptionCreate",
  SubscriptionCreateSchema
);
export const OpenAPISubscriptionUpdate = registry.register(
  "SubscriptionUpdate",
  SubscriptionUpdateSchema
);

export const OpenAPITemplateLayoutCreate = registry.register(
  "TemplateLayoutCreate",
  TemplateLayoutCreateSchema
);
export const OpenAPITemplateLayoutUpdate = registry.register(
  "TemplateLayoutUpdate",
  TemplateLayoutUpdateSchema
);

export const OpenAPIColorSchemeCreate = registry.register(
  "ColorSchemeCreate",
  ColorSchemeCreateSchema
);
export const OpenAPIColorSchemeUpdate = registry.register(
  "ColorSchemeUpdate",
  ColorSchemeUpdateSchema
);

export const OpenAPIAffiliateProgramCreate = registry.register(
  "AffiliateProgramCreate",
  AffiliateProgramCreateSchema
);
export const OpenAPIAffiliateProgramUpdate = registry.register(
  "AffiliateProgramUpdate",
  AffiliateProgramUpdateSchema
);

export const OpenAPIAffiliateCreate = registry.register(
  "AffiliateCreate",
  AffiliateCreateSchema
);
export const OpenAPIAffiliateUpdate = registry.register(
  "AffiliateUpdate",
  AffiliateUpdateSchema
);

export const OpenAPILinkClickCreate = registry.register(
  "LinkClickCreate",
  LinkClickCreateSchema
);
