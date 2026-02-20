import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OrdersTable } from "../components/OrdersTable";

export default async function AdminOrdersPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();

    // Verify Auth visually
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/auth`);

    // Fetch All Orders
    const { data: orders, error } = await supabase
        .from("orders")
        .select(`
            id, created_at, total, status, payment_method, shipping_method, shipping_address,
            user:profiles(full_name, phone)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500">Error loading orders: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--wide-text-primary)]">Orders Management</h1>
                <p className="text-sm text-[var(--wide-text-muted)]">
                    View and update the status of all customer orders. Changing a status here sends an automated update to the customer if configured.
                </p>
            </div>

            <OrdersTable initialOrders={orders as any[]} locale={locale} />
        </div>
    );
}
