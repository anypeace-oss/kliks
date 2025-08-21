import {
  OpenAPIRegistry,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Extend Zod to support .openapi() metadata
extendZodWithOpenApi(z);

// Singleton registry used across the app
export const registry = new OpenAPIRegistry();
