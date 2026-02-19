"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const t = useTranslations("cart");
    const locale = useLocale();
    const isRTL = locale === "ar";
    const { items, count, total, removeItem, updateQuantity, user } = useCart();

    const formatPrice = (price: number) =>
        new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
            style: "currency",
            currency: "EGP",
            maximumFractionDigits: 0,
        }).format(price);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: isRTL ? "-100%" : "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: isRTL ? "-100%" : "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className={`fixed top-0 z-50 flex h-full w-full max-w-md flex-col border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] shadow-2xl ${isRTL ? "left-0 border-r" : "right-0 border-l"
                            }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[var(--wide-border)] p-5">
                            <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--wide-text-primary)]">
                                <ShoppingBag className="h-5 w-5 text-[var(--wide-neon)]" />
                                {t("title")}
                                {count > 0 && (
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--wide-neon)] text-xs font-bold text-black">
                                        {count}
                                    </span>
                                )}
                            </h2>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={isRTL ? "إغلاق" : "Close"}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wide-surface)] text-[var(--wide-text-muted)] transition-colors hover:text-[var(--wide-neon)]"
                            >
                                <X className="h-5 w-5" />
                            </motion.button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--wide-surface)]">
                                        <ShoppingBag className="h-10 w-10 text-[var(--wide-text-muted)]" />
                                    </div>
                                    <p className="text-lg font-semibold text-[var(--wide-text-primary)]">
                                        {t("empty")}
                                    </p>
                                    <p className="text-sm text-[var(--wide-text-muted)]">
                                        {t("emptyDesc")}
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="mt-2 rounded-xl bg-[var(--wide-neon)] px-6 py-2.5 text-sm font-bold text-black transition-all hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                                    >
                                        {t("continueShopping")}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((item) => {
                                        const name =
                                            locale === "ar"
                                                ? item.product?.name_ar
                                                : item.product?.name_en;
                                        const price =
                                            item.product?.sale_price ?? item.product?.price ?? 0;
                                        const image = item.product?.images?.[0] ?? "/products/IMG_0575.jpg";

                                        return (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: isRTL ? -100 : 100 }}
                                                className="flex gap-4 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] p-3"
                                            >
                                                {/* Image */}
                                                <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                                                    <Image
                                                        src={image}
                                                        alt={name ?? "Product"}
                                                        fill
                                                        className="object-cover"
                                                        sizes="80px"
                                                    />
                                                </div>

                                                {/* Details */}
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div>
                                                        <h3 className="text-sm font-semibold text-[var(--wide-text-primary)] line-clamp-1">
                                                            {name}
                                                        </h3>
                                                        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--wide-text-muted)]">
                                                            <span className="rounded bg-[var(--wide-surface)] px-1.5 py-0.5">
                                                                {item.size}
                                                            </span>
                                                            {item.color && (
                                                                <span
                                                                    className="h-3.5 w-3.5 rounded-full border border-[var(--wide-border)]"
                                                                    style={{ backgroundColor: item.color }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    updateQuantity(item.id, item.quantity - 1)
                                                                }
                                                                title={isRTL ? "تقليل الكمية" : "Decrease quantity"}
                                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--wide-surface)] text-[var(--wide-text-muted)] transition-colors hover:text-[var(--wide-neon)]"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium text-[var(--wide-text-primary)]">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    updateQuantity(item.id, item.quantity + 1)
                                                                }
                                                                title={isRTL ? "زيادة الكمية" : "Increase quantity"}
                                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--wide-surface)] text-[var(--wide-text-muted)] transition-colors hover:text-[var(--wide-neon)]"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>

                                                        {/* Price + Remove */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-[var(--wide-neon)]">
                                                                {formatPrice(price * item.quantity)}
                                                            </span>
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                title={isRTL ? "حذف" : "Remove"}
                                                                className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--wide-text-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-[var(--wide-border)] p-5">
                                <div className="mb-2 flex items-center justify-between text-sm text-[var(--wide-text-muted)]">
                                    <span>{t("subtotal")}</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className="mb-4 flex items-center justify-between text-sm">
                                    <span className="text-[var(--wide-text-muted)]">{t("shipping")}</span>
                                    <span className="font-medium text-[var(--wide-neon)]">{t("freeShipping")}</span>
                                </div>
                                <div className="mb-4 flex items-center justify-between border-t border-[var(--wide-border)] pt-3">
                                    <span className="text-base font-bold text-[var(--wide-text-primary)]">
                                        {t("total")}
                                    </span>
                                    <span className="text-lg font-bold text-[var(--wide-neon)]">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                                <a
                                    href={user ? `/${locale}/checkout` : `/${locale}/auth`}
                                    onClick={onClose}
                                    className="shimmer-effect block w-full rounded-xl bg-[var(--wide-neon)] py-3.5 text-center text-sm font-bold text-black transition-all hover:shadow-[0_0_30px_rgba(57,255,20,0.3)]"
                                >
                                    {t("checkout")}
                                </a>
                                <button
                                    onClick={onClose}
                                    className="mt-3 w-full text-center text-sm text-[var(--wide-text-muted)] transition-colors hover:text-[var(--wide-text-primary)]"
                                >
                                    {t("continueShopping")}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
