"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Package, Clock, ChevronRight, ShoppingBag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/providers/CartProvider";
import Navbar from "@/components/layout/Navbar";

interface Order {
    id: string;
    status: string;
    total: number;
    created_at: string;
    order_items: { id: string; name_ar: string; name_en: string; quantity: number }[];
}

const statusConfig: Record<string, { color: string; emoji: string }> = {
    pending: { color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30", emoji: "🟡" },
    confirmed: { color: "text-blue-400 bg-blue-400/10 border-blue-400/30", emoji: "🔵" },
    shipped: { color: "text-orange-400 bg-orange-400/10 border-orange-400/30", emoji: "🟠" },
    delivered: { color: "text-green-400 bg-green-400/10 border-green-400/30", emoji: "🟢" },
    cancelled: { color: "text-red-400 bg-red-400/10 border-red-400/30", emoji: "🔴" },
};

export default function OrdersPage() {
    const t = useTranslations("orders");
    const locale = useLocale();
    const router = useRouter();
    const { user } = useCart();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push(`/${locale}/auth`);
            return;
        }
        const fetchOrders = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("orders")
                .select("id, status, total, created_at, order_items(id, name_ar, name_en, quantity)")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });
            if (data) setOrders(data as Order[]);
            setLoading(false);
        };
        fetchOrders();
    }, [user, router, locale]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
            style: "currency", currency: "EGP", maximumFractionDigits: 0,
        }).format(price);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
            day: "numeric", month: "short", year: "numeric",
        });

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[var(--wide-bg-primary)] pt-20 pb-12">
                <div className="mx-auto max-w-3xl px-4">
                    <h1 className="mb-8 text-3xl font-black text-[var(--wide-text-primary)]">{t("title")}</h1>

                    {loading ? (
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="animate-pulse rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-5 h-28" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <ShoppingBag className="mb-4 h-16 w-16 text-[var(--wide-text-muted)]" />
                            <h2 className="text-lg font-bold text-[var(--wide-text-primary)]">{t("empty")}</h2>
                            <p className="mt-2 text-sm text-[var(--wide-text-muted)]">{t("emptyDesc")}</p>
                            <a href={`/${locale}`} className="mt-6 rounded-xl bg-[var(--wide-neon)] px-6 py-3 text-sm font-bold text-black">
                                {locale === "ar" ? "ابدأ التسوق" : "Start Shopping"}
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map((order, i) => {
                                const status = statusConfig[order.status] ?? statusConfig.pending;
                                const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
                                return (
                                    <motion.a
                                        key={order.id}
                                        href={`/${locale}/orders/${order.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex items-center gap-4 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-5 transition-all hover:border-[var(--wide-neon-dim)]"
                                    >
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--wide-surface)]">
                                            <Package className="h-6 w-6 text-[var(--wide-neon)]" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-sm font-bold text-[var(--wide-text-primary)]">
                                                    #{order.id.slice(0, 8).toUpperCase()}
                                                </span>
                                                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.color}`}>
                                                    {status.emoji} {t(order.status)}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-3 text-xs text-[var(--wide-text-muted)]">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(order.created_at)}</span>
                                                <span>{itemCount} {locale === "ar" ? "منتج" : "items"}</span>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <span className="text-sm font-bold text-[var(--wide-neon)]">{formatPrice(order.total)}</span>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-[var(--wide-text-muted)]" />
                                    </motion.a>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
