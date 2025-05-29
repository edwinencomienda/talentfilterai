"use client"

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import AppLogo from "./app-logo";

export default function AppLayout({ children }: { children: React.ReactNode }) {

    return <div className="container mx-auto py-8">
        <div className="mb-8 flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold flex items-center gap-2">
                <AppLogo logoClassName="w-20" />
            </Link>
            <div className="flex items-center gap-2">
                <UserButton />
            </div>
        </div>
        {children}
    </div>;
}