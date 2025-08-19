"use client";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
    const { data: session, isPending } = authClient.useSession()

    if (session && isPending) {
        redirect("/studio/dashboard");
    }

    return <LoginForm />;
}