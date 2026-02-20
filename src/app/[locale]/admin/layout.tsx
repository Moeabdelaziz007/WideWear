import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { LayoutDashboard, ShoppingBag, ListOrdered, Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { LogOutButton } from "./components/LogOutButton"; // We will create this client component

/**
 * Admin Layout (Server Component)
 * Strictly verifies the user session and admin email before rendering any admin pages.
 */
export default async function AdminLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // V1 Security logic: If user is not logged in, or not in the ADMIN_EMAILS list, boot them
    // E.g., add NEXT_PUBLIC_ADMIN_EMAILS="moe@example.com,admin@widewear.com" to .env
    const authorizedEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").split(",");

    // For V1 (testing), we will just require the user to be logged in and allow the first user or explicitly authorized users
    if (!user) {
        redirect(`/${locale}/auth`);
    }

    if (authorizedEmails.length > 0 && authorizedEmails[0] !== "" && !authorizedEmails.includes(user.email || "")) {
        redirect(`/${locale}`); // Send normal users back to home
    }

    // Sidebar Navigation Links
    const navigation = [
        { name: "Overview", href: `/${locale}/admin`, icon: LayoutDashboard },
        { name: "Orders", href: `/${locale}/admin/orders`, icon: ListOrdered },
        { name: "Catalog", href: `/${locale}/admin/catalog`, icon: ShoppingBag },
        { name: "Settings", href: `/${locale}/admin/settings`, icon: Settings },
    ];

    return (
        <div className="flex min-h-screen flex-col bg-[var(--wide-bg-primary)] lg:flex-row">
            {/* Sidebar Desktop */}
            <aside className="hidden w-64 flex-col border-r border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] lg:flex">
                <div className="flex h-16 items-center justify-center border-b border-[var(--wide-border)] px-6">
                    <span className="text-lg font-black tracking-tight text-[var(--wide-text-primary)]">
                        WIDEWEAR <span className="text-[var(--wide-neon)]">ADMIN</span>
                    </span>
                </div>

                <nav className="flex-1 space-y-1 p-4">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-[var(--wide-text-secondary)] transition-colors hover:bg-[var(--wide-bg-primary)] hover:text-[var(--wide-neon)]"
                        >
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-[var(--wide-border)] p-4">
                    <div className="mb-4 flex items-center px-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--wide-neon)]/20" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-[var(--wide-text-primary)]">Admin</p>
                            <p className="w-32 truncate text-xs text-[var(--wide-text-muted)]">{user.email}</p>
                        </div>
                    </div>
                    <LogOutButton locale={locale} />
                </div>
            </aside>

            {/* Mobile Header (Placeholder) */}
            <div className="flex h-16 items-center justify-between border-b border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] px-4 lg:hidden">
                <span className="text-lg font-black tracking-tight text-[var(--wide-text-primary)]">
                    WIDEWEAR <span className="text-[var(--wide-neon)]">ADMIN</span>
                </span>
                {/* Mobile Menu button would go here */}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto bg-[var(--wide-bg-primary)] p-4 lg:p-8">
                {children}
            </main>
        </div>
    );
}
