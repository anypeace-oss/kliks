"use client";

import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { authClient } from "@/lib/auth-client";
import { IconFlower } from "@tabler/icons-react";

export default function LoginPage() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="flex justify-center items-center h-screen">
                <IconFlower className="animate-spin w-10 h-10" />
            </div>
        );
    }

    if (session) {
        redirect("/studio/dashboard");
        return null; // required because redirect does not return JSX
    }

    return <LoginForm />;
}
