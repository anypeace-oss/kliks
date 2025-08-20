import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config";

export const db = drizzle(process.env.DATABASE_URL!);

export { schema };
