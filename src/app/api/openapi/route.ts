import { NextResponse } from "next/server";
import { OpenApiGeneratorV31 } from "@asteasolutions/zod-to-openapi";
import { registry } from "@/lib/openapi/registry";
import "@/lib/openapi/schemas";
import "@/lib/openapi/paths";

export async function GET() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  const doc = generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Kreeasi Link-in-Bio API",
      version: "1.0.0",
      description: "OpenAPI spec generated from Zod schemas",
    },
    servers: [{ url: "/" }],
  });

  return NextResponse.json(doc);
}
