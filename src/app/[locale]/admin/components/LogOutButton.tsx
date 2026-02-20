"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function LogOutButton({ locale }: { locale: string }) {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push(`/${locale}/auth`);
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
            <LogOut className="mr-2 h-4 w-4" />
            {loading ? "Logging out..." : "Log Out"}
        </button>
    );
}
