import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  rateLimit: {
    enabled: true,
    max: 10,
    window: 60,
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-real-ip", "x-forwarded-for", "cf-connecting-ip"], // bisa ditambah sesuai kebutuhan
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  cookies: {
    prefix: "ba_",
  },
});
