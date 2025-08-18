// components/header-server.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { HeroHeader } from "./header-client";

export async function HeaderServer() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return <HeroHeader
    isAuthenticated={!!session}
    user={session?.user}
  />;
}