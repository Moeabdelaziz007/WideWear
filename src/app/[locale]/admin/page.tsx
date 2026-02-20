import { createClient } from "@/lib/supabase/server";
import { DollarSign, Package, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AdminOverviewPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();

    // Verify Auth visually (layout handles actual redirect, but good for type safety)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/auth`);

    // Fetch Aggregated Data
    const { data: orders, error } = await supabase
        .from("orders")
        .select("total, status, created_at, id")
        .order("created_at", { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500">Error loading dashboard data</div>;
    }

    // Compute Metrics
    const totalRevenue = orders
        .filter(o => o.status !== "cancelled" && o.status !== "refunded")
        .reduce((sum, o) => sum + (o.total || 0), 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const itemsShipped = orders.filter(o => o.status === "shipped" || o.status === "delivered").length;

    const recentOrders = orders.slice(0, 5); // Latest 5

    const cards = [
        { title: "Total Revenue", value: `EGP ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-500" },
        { title: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, color: "text-[var(--wide-neon)]" },
        { title: "Pending Orders", value: pendingOrders.toString(), icon: Package, color: "text-yellow-500" },
        { title: "Shipped/Delivered", value: itemsShipped.toString(), icon: Truck, color: "text-blue-500" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--wide-text-primary)]">Dashboard Overview</h1>
                <p className="text-sm text-[var(--wide-text-muted)]">Welcome back, Founder. Here's your store's performance.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <div key={card.title} className="rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-[var(--wide-text-secondary)]">{card.title}</h3>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <p className="mt-4 text-3xl font-bold text-[var(--wide-text-primary)]">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Orders Overview */}
            <div className="rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] shadow-sm">
                <div className="flex items-center justify-between border-b border-[var(--wide-border)] p-6">
                    <h2 className="text-lg font-semibold text-[var(--wide-text-primary)]">Recent Orders</h2>
                    <Link href={`/${locale}/admin/orders`} className="text-sm font-medium text-[var(--wide-neon)] hover:underline">
                        View All
                    </Link>
                </div>
                <div className="p-6">
                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-[var(--wide-text-muted)]">No recent orders found.</p>
                    ) : (
                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between rounded-lg border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] p-4">
                                    <div>
                                        <p className="font-mono text-sm font-bold text-[var(--wide-text-primary)]">#{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-[var(--wide-text-muted)]">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                            ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500' :
                                                    order.status === 'shipped' ? 'bg-purple-500/10 text-purple-500' :
                                                        order.status === 'delivered' ? 'bg-green-500/10 text-green-500' :
                                                            'bg-red-500/10 text-red-500'}`}
                                        >
                                            {order.status}
                                        </span>
                                        <span className="font-black text-[var(--wide-text-primary)]">EGP {order.total}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
