import { account, session, user, verification } from "../../auth-schema";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";

export const db = drizzle(process.env.DATABASE_URL!);

export const schema = {
  user: user,
  account: account,
  session: session,
  verification: verification,
};
