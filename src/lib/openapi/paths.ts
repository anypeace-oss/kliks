import { registry } from "./registry";
import {
  OpenAPIProfileCreate,
  OpenAPIProfileUpdate,
  OpenAPILinkCreate,
  OpenAPILinkUpdate,
  OpenAPIProductCategoryCreate,
  OpenAPIProductCreate,
  OpenAPIOrderCreate,
  OpenAPIOrderItemCreate,
  OpenAPISubscriptionCreate,
  OpenAPITemplateLayoutCreate,
  OpenAPIColorSchemeCreate,
  OpenAPIAffiliateProgramCreate,
  OpenAPIAffiliateCreate,
  OpenAPILinkClickCreate,
} from "./schemas";
import { z } from "zod";

// Common responses
const ErrorResponse = z.object({ error: z.string() }).openapi("ErrorResponse");

const SuccessMessage = z
  .object({ message: z.string() })
  .openapi("SuccessMessage");

// Profiles routes
registry.registerPath({
  method: "get",
  path: "/api/link-in-bio/profiles",
  summary: "List profiles for current user",
  responses: {
    200: {
      description: "Profiles",
      content: {
        "application/json": { schema: z.array(OpenAPIProfileCreate) },
      },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/profiles",
  summary: "Create profile",
  request: {
    body: {
      content: { "application/json": { schema: OpenAPIProfileCreate } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPIProfileCreate } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/api/link-in-bio/profiles",
  summary: "Update profile",
  request: {
    body: { content: { "application/json": { schema: OpenAPIProfileUpdate } } },
  },
  responses: {
    200: {
      description: "Updated",
      content: { "application/json": { schema: OpenAPIProfileUpdate } },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/link-in-bio/profiles",
  summary: "Delete profile",
  request: {
    query: z.object({ id: z.string() }).openapi({ description: "Profile ID" }),
  },
  responses: {
    200: {
      description: "Deleted",
      content: { "application/json": { schema: SuccessMessage } },
    },
    400: {
      description: "Bad request",
      content: { "application/json": { schema: ErrorResponse } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: ErrorResponse } },
    },
    500: {
      description: "Server error",
      content: { "application/json": { schema: ErrorResponse } },
    },
  },
});

// For brevity, register representative endpoints for other modules
// Links
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/links",
  summary: "Create link",
  request: {
    body: { content: { "application/json": { schema: OpenAPILinkCreate } } },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPILinkCreate } },
    },
  },
});
registry.registerPath({
  method: "put",
  path: "/api/link-in-bio/links",
  summary: "Update link",
  request: {
    body: { content: { "application/json": { schema: OpenAPILinkUpdate } } },
  },
  responses: {
    200: {
      description: "Updated",
      content: { "application/json": { schema: OpenAPILinkUpdate } },
    },
  },
});

// Product categories
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/product-categories",
  summary: "Create product category",
  request: {
    body: {
      content: { "application/json": { schema: OpenAPIProductCategoryCreate } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPIProductCategoryCreate } },
    },
  },
});

// Products
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/products",
  summary: "Create product",
  request: {
    body: { content: { "application/json": { schema: OpenAPIProductCreate } } },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPIProductCreate } },
    },
  },
});

// Orders
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/orders",
  summary: "Create order",
  request: {
    body: { content: { "application/json": { schema: OpenAPIOrderCreate } } },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPIOrderCreate } },
    },
  },
});

// Order items
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/order-items",
  summary: "Create order item",
  request: {
    body: {
      content: { "application/json": { schema: OpenAPIOrderItemCreate } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPIOrderItemCreate } },
    },
  },
});

// Subscriptions
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/subscriptions?type=subscription",
  summary: "Create subscription",
  request: {
    body: {
      content: { "application/json": { schema: OpenAPISubscriptionCreate } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPISubscriptionCreate } },
    },
  },
});

// Templates
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/templates?type=layout",
  summary: "Create layout template",
  request: {
    body: {
      content: { "application/json": { schema: OpenAPITemplateLayoutCreate } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPITemplateLayoutCreate } },
    },
  },
});
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/templates?type=color",
  summary: "Create color scheme",
  request: {
    body: {
      content: { "application/json": { schema: OpenAPIColorSchemeCreate } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPIColorSchemeCreate } },
    },
  },
});

// Affiliates
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/affiliates?type=program",
  summary: "Create affiliate program",
  request: {
    body: {
      content: {
        "application/json": { schema: OpenAPIAffiliateProgramCreate },
      },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: {
        "application/json": { schema: OpenAPIAffiliateProgramCreate },
      },
    },
  },
});
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/affiliates?type=affiliate",
  summary: "Create affiliate relation",
  request: {
    body: {
      content: { "application/json": { schema: OpenAPIAffiliateCreate } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPIAffiliateCreate } },
    },
  },
});

// Analytics
registry.registerPath({
  method: "post",
  path: "/api/link-in-bio/analytics",
  summary: "Record link click",
  request: {
    body: {
      content: { "application/json": { schema: OpenAPILinkClickCreate } },
    },
  },
  responses: {
    200: {
      description: "Created",
      content: { "application/json": { schema: OpenAPILinkClickCreate } },
    },
  },
});
