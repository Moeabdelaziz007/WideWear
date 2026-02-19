"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2, Package, Truck } from "lucide-react";
import ReactConfetti from "canvas-confetti";
import Navbar from "@/components/layout/Navbar";

export default function OrderSuccessPage() {
    const t = useTranslations("checkout");
    const locale = useLocale();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId") ?? "";

    useEffect(() => {
        // Trigger confetti burst on success page load
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            ReactConfetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                colors: ['#39ff14', '#00ff88', '#ffffff'] // WideWear neon colors
            });
            ReactConfetti({
                ...defaults, particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#39ff14', '#00ff88', '#ffffff']
            });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Navbar />
            <div className="flex min-h-screen items-center justify-center bg-[var(--wide-bg-primary)] pt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mx-4 w-full max-w-md text-center"
                >
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--wide-neon)]/10"
                    >
                        <CheckCircle2 className="h-14 w-14 text-[var(--wide-neon)]" />
                    </motion.div>

                    <h1 className="mb-2 text-2xl font-black text-[var(--wide-text-primary)]">
                        {t("orderPlaced")}
                    </h1>
                    <p className="mb-6 text-sm text-[var(--wide-text-muted)]">
                        {t("orderPlacedDesc")}
                    </p>

                    {/* Order ID */}
                    {orderId && (
                        <div className="mb-6 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-4">
                            <p className="text-xs text-[var(--wide-text-muted)]">
                                {locale === "ar" ? "رقم الطلب" : "Order ID"}
                            </p>
                            <p className="mt-1 font-mono text-lg font-bold text-[var(--wide-neon)]">
                                #{orderId.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                    )}

                    {/* Delivery Info */}
                    <div className="mb-8 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-4">
                            <Truck className="mx-auto mb-2 h-6 w-6 text-[var(--wide-neon)]" />
                            <p className="text-xs font-medium text-[var(--wide-text-primary)]">{t("days23")}</p>
                        </div>
                        <div className="rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-4">
                            <Package className="mx-auto mb-2 h-6 w-6 text-[var(--wide-neon)]" />
                            <p className="text-xs font-medium text-[var(--wide-text-primary)]">{t("days57")}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <a
                            href={`/${locale}/orders`}
                            className="w-full rounded-xl bg-[var(--wide-neon)] py-3.5 text-center text-sm font-bold text-black"
                        >
                            {t("trackOrder")}
                        </a>
                        <a
                            href={`/${locale}`}
                            className="w-full rounded-xl border border-[var(--wide-border)] py-3.5 text-center text-sm font-medium text-[var(--wide-text-secondary)]"
                        >
                            {locale === "ar" ? "العودة للرئيسية" : "Back to Home"}
                        </a>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
