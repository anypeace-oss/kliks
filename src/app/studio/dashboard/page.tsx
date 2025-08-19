"use client"
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

import { SectionCards } from "@/components/section-cards";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";


export default function Page() {
    const { data: session, isPending } = authClient.useSession()

    if (session && isPending) {
        redirect("/studio/dashboard");
    }
    return (
        <div className="flex flex-1 flex-col">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <SectionCards />
                <div className="px-4 lg:px-6">
                    <ChartAreaInteractive />
                </div>
                {/* <DataTable data={data} /> */}
            </div>
        </div>
    )
}
