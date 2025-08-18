// components/user-button-client.tsx
'use client'
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { SignOutButton } from "./signout-button";
import Image from "next/image";

interface UserButtonProps {
    user?: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function UserButtonClient({ user }: UserButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8 relative">
                        <Image src={user?.image ?? ""} alt={user?.name ?? ""} fill />
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="p-2">
                    <p className="text-sm font-medium">{user?.name ?? 'User'}</p>
                    {user?.email && (
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    )}
                </div>
                <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}