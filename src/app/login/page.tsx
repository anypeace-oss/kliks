"use client"
// app/login/page.tsx (Server Component)
// import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { authClient } from "@/lib/auth-client";
// import { auth } from "@/lib/auth";


export default function LoginPage() {
    // const session = await auth.api.getSession({
    //     headers: await headers()
    // });
    const { data: session } = authClient.useSession()
    // const { data: session, isPending } = authClient.useSession();

    if (session) {
        redirect("/studio/dashboard");
    }

    return <LoginForm />;
}