"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";

type Order = {
    id: string;
    created_at: string;
    total: number;
    status: string;
    payment_method: string;
    shipping_address: {
        fullName: string;
        city: string;
        phone?: string;
    };
    user: { full_name: string; phone: string } | null;
};

export function OrdersTable({ initialOrders, locale }: { initialOrders: Order[]; locale: string }) {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const filteredOrders = orders.filter((o) =>
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.shipping_address?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.full_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            const res = await fetch("/api/admin/orders", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: orderId, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            // Optimistic update
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
            router.refresh(); // Refresh server data
        } catch (error) {
            console.error("Status update error:", error);
            alert("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"];

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--wide-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search orders (ID, Name)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] py-2 pl-9 pr-4 text-sm text-[var(--wide-text-primary)] focus:border-[var(--wide-neon)] focus:outline-none focus:ring-1 focus:ring-[var(--wide-neon)]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-[var(--wide-border)] bg-[var(--wide-bg-primary)] text-[var(--wide-text-muted)]">
                            <tr>
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Total</th>
                                <th className="px-6 py-4 font-medium">Method</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--wide-border)]">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-[var(--wide-text-muted)]">
                                        No orders found matching "{search}"
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="transition-colors hover:bg-[var(--wide-bg-primary)]">
                                        <td className="px-6 py-4 font-mono font-medium text-[var(--wide-text-primary)]">
                                            #{order.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-4 text-[var(--wide-text-secondary)]">
                                            {new Date(order.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-[var(--wide-text-primary)]">
                                                {order.shipping_address?.fullName || order.user?.full_name || "Guest"}
                                            </p>
                                            <p className="text-xs text-[var(--wide-text-muted)]">
                                                {order.shipping_address?.city || "N/A"}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-[var(--wide-text-primary)]">
                                            EGP {order.total}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-400 capitalize">
                                                {order.payment_method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative flex items-center gap-2">
                                                <select
                                                    disabled={updatingId === order.id}
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`appearance-none rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider outline-none transition-colors disabled:opacity-50
                                                        ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 focus:ring-1 focus:ring-yellow-500' :
                                                            order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20 focus:ring-1 focus:ring-blue-500' :
                                                                order.status === 'shipped' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20 focus:ring-1 focus:ring-purple-500' :
                                                                    order.status === 'delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20 focus:ring-1 focus:ring-green-500' :
                                                                        'bg-red-500/10 text-red-500 border border-red-500/20 focus:ring-1 focus:ring-red-500'}
                                                    `}
                                                >
                                                    {statusOptions.map((s) => (
                                                        <option key={s} value={s} className="bg-[var(--wide-bg-primary)] text-white">{s}</option>
                                                    ))}
                                                </select>
                                                {updatingId === order.id && (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--wide-neon)] border-t-transparent" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
