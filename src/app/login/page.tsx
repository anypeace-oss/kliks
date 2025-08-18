// app/login/page.tsx (Server Component)
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { auth } from "@/lib/auth";


export default async function LoginPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (session) {
        redirect("/studio/dashboard");
    }

    return <LoginForm />;
}