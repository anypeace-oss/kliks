"use client";

import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
    const { data: session } = authClient.useSession();

    if (session) {
        redirect("/studio/dashboard");
    }

    return <LoginForm />;
}
