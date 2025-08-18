// components/user-button-server.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserButtonClient } from "./user-button-client";

export async function UserButtonServer() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    return <UserButtonClient user={session?.user} />;
}