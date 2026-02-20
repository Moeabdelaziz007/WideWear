"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Package, MapPin, Clock, CreditCard, ArrowLeft, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/providers/CartProvider";
import Navbar from "@/components/layout/Navbar";

interface OrderDetail {
    id: string;
    status: string;
    total: number;
    shipping_address: { fullName: string; address1: string; address2?: string; city: string };
    phone: string;
    payment_method: string;
    shipping_method?: string;
    notes: string | null;
    created_at: string;
    order_items: {
        id: string;
        name_ar: string;
        name_en: string;
        price: number;
        size: string;
        color: string | null;
        quantity: number;
        image_url: string | null;
    }[];
}

const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const t = useTranslations("orders");
    const tc = useTranslations("checkout");
    const locale = useLocale();
    const router = useRouter();
    const { user } = useCart();
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { router.push(`/${locale}/auth`); return; }
        const supabase = createClient();

        const fetchOrder = async () => {
            const { data } = await supabase
                .from("orders")
                .select("*, order_items(*)")
                .eq("id", id)
                .eq("user_id", user.id)
                .single();
            if (data) setOrder(data as OrderDetail);
            setLoading(false);
        };
        fetchOrder();

        // Realtime subscription for status updates
        const channel = supabase
            .channel(`order-${id}`)
            .on("postgres_changes", {
                event: "UPDATE",
                schema: "public",
                table: "orders",
                filter: `id=eq.${id}`,
            }, (payload) => {
                setOrder((prev) => prev ? { ...prev, ...payload.new } as OrderDetail : prev);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, id, router, locale]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
            style: "currency", currency: "EGP", maximumFractionDigits: 0,
        }).format(price);

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
            day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
        });

    if (loading) return (
        <>
            <Navbar />
            <div className="flex min-h-screen items-center justify-center bg-[var(--wide-bg-primary)] pt-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--wide-neon)] border-t-transparent" />
            </div>
        </>
    );

    if (!order) return (
        <>
            <Navbar />
            <div className="flex min-h-screen items-center justify-center bg-[var(--wide-bg-primary)] pt-16">
                <p className="text-[var(--wide-text-muted)]">{locale === "ar" ? "الطلب مش موجود" : "Order not found"}</p>
            </div>
        </>
    );

    const currentStep = STATUS_STEPS.indexOf(order.status);

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[var(--wide-bg-primary)] pt-20 pb-12">
                <div className="mx-auto max-w-3xl px-4">
                    {/* Header */}
                    <button onClick={() => router.push(`/${locale}/orders`)} className="mb-6 flex items-center gap-2 text-sm text-[var(--wide-text-muted)] hover:text-[var(--wide-neon)]">
                        <ArrowLeft className="h-4 w-4" />
                        {t("title")}
                    </button>

                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-[var(--wide-text-primary)]">
                                #{order.id.slice(0, 8).toUpperCase()}
                            </h1>
                            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--wide-text-muted)]">
                                <Clock className="h-3 w-3" /> {formatDate(order.created_at)}
                            </p>
                        </div>
                        <span className="text-lg font-bold text-[var(--wide-neon)]">{formatPrice(order.total)}</span>
                    </div>

                    {/* Status Timeline */}
                    {order.status !== "cancelled" && (
                        <div className="mb-8 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-6">
                            <div className="flex items-center justify-between">
                                {STATUS_STEPS.map((step, i) => (
                                    <div key={step} className="flex flex-1 items-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <motion.div
                                                initial={false}
                                                animate={{ scale: i === currentStep ? 1.2 : 1 }}
                                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${i <= currentStep
                                                        ? "border-[var(--wide-neon)] bg-[var(--wide-neon)]/10 text-[var(--wide-neon)]"
                                                        : "border-[var(--wide-border)] text-[var(--wide-text-muted)]"
                                                    }`}
                                            >
                                                {i <= currentStep ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs">{i + 1}</span>}
                                            </motion.div>
                                            <span className={`text-[10px] font-medium ${i <= currentStep ? "text-[var(--wide-neon)]" : "text-[var(--wide-text-muted)]"
                                                }`}>
                                                {t(step)}
                                            </span>
                                        </div>
                                        {i < STATUS_STEPS.length - 1 && (
                                            <div className={`h-0.5 flex-1 mx-2 transition-all ${i < currentStep ? "bg-[var(--wide-neon)]" : "bg-[var(--wide-border)]"
                                                }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Items */}
                    <div className="mb-6 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-5">
                        <h3 className="mb-4 flex items-center gap-2 font-semibold text-[var(--wide-text-primary)]">
                            <Package className="h-4 w-4 text-[var(--wide-neon)]" />
                            {t("items")} ({order.order_items.length})
                        </h3>
                        <div className="space-y-3">
                            {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 rounded-lg bg-[var(--wide-bg-primary)] p-3">
                                    <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                                        <Image src={item.image_url ?? "/products/IMG_0575.jpg"} alt={locale === "ar" ? item.name_ar : item.name_en} fill className="object-cover" sizes="56px" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[var(--wide-text-primary)]">
                                            {locale === "ar" ? item.name_ar : item.name_en}
                                        </p>
                                        <p className="text-xs text-[var(--wide-text-muted)]">{item.size} × {item.quantity}</p>
                                    </div>
                                    <span className="text-sm font-bold text-[var(--wide-neon)]">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping + Payment */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-5">
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--wide-text-primary)]">
                                <MapPin className="h-4 w-4 text-[var(--wide-neon)]" />
                                {locale === "ar" ? "عنوان التوصيل" : "Shipping Address"}
                            </h3>
                            <div className="space-y-1 text-sm text-[var(--wide-text-secondary)]">
                                <p className="font-medium text-[var(--wide-text-primary)]">{order.shipping_address.fullName}</p>
                                <p>{order.phone}</p>
                                <p>{order.shipping_address.address1}</p>
                                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                                <p>{order.shipping_address.city}</p>
                                {order.shipping_method && (
                                    <p className="mt-1 text-sm text-[var(--wide-text-secondary)]">
                                        <span className="font-medium text-[var(--wide-text-primary)]">{t("shippingMethod")}:</span> {tc(order.shipping_method)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-5">
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--wide-text-primary)]">
                                <CreditCard className="h-4 w-4 text-[var(--wide-neon)]" />
                                {locale === "ar" ? "طريقة الدفع" : "Payment Method"}
                            </h3>
                            <p className="text-sm text-[var(--wide-text-secondary)]">
                                {order.payment_method === "cod"
                                    ? locale === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"
                                    : order.payment_method}
                            </p>
                            {order.notes && (
                                <p className="mt-3 text-sm italic text-[var(--wide-text-muted)]">
                                    {locale === "ar" ? "ملاحظات: " : "Notes: "}{order.notes}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
