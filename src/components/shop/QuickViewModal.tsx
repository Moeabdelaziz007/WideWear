"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, ExternalLink, Ruler, ShoppingBag, Plus, Minus, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import SizeGuideModal from "./SizeGuideModal";
import useFocusTrap from "@/lib/useFocusTrap";

interface Product {
    id: string;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    price: number;
    sale_price: number | null;
    category: string;
    sizes: string[];
    colors: { name: string; hex: string }[];
    images: string[];
    badge: string | null;
    stock: number;
    video_url?: string;
}

interface QuickViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function QuickViewModal({ isOpen, onClose, product }: QuickViewModalProps) {
    const t = useTranslations("shop");
    const locale = useLocale();
    const isRTL = locale === "ar";
    const { addItem } = useCart();
    const { has: hasWish, toggle: toggleWish } = useWishlist();
    const isWish = hasWish(product?.id ?? "");
    const { performanceMode } = useTheme();
    const reduceMotion = useReducedMotion();
    const disableAnimations = performanceMode || reduceMotion;

    const containerRef = useFocusTrap(isOpen);

    // build list of media (video first if present)
    const media: { type: "image" | "video"; src: string }[] = [];
    if (product?.video_url) {
        media.push({ type: "video", src: product.video_url });
    }
    product?.images?.forEach((src) => media.push({ type: "image", src }));
    const [galleryIndex, setGalleryIndex] = useState(0);

    useEffect(() => {
        if (isOpen) setGalleryIndex(0);
    }, [isOpen, product]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (isOpen) {
                if (e.key === "ArrowRight") {
                    setGalleryIndex((i) => Math.min(i + 1, media.length - 1));
                } else if (e.key === "ArrowLeft") {
                    setGalleryIndex((i) => Math.max(i - 1, 0));
                }
            }
        };
        if (isOpen) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose, media.length]);

    const [selectedSize, setSelectedSize] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [quantity, setQuantity] = useState(1);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    if (!product) return null;

    const name = isRTL ? product.name_ar : product.name_en;
    const desc = isRTL ? product.description_ar : product.description_en;
    const currentPrice = product.sale_price ?? product.price;

    const formatPrice = (price: number) =>
        new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
            style: "currency",
            currency: "EGP",
            maximumFractionDigits: 0,
        }).format(price);

    const handleAddToCart = () => {
        if (!selectedSize && product.sizes?.length > 0) return;

        addItem(
            product.id,
            selectedSize || "OS",
            selectedColor || undefined,
            quantity
        );

        onClose();
        // Reset state for next time
        setSelectedSize("");
        setSelectedColor("");
        setQuantity(1);
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={disableAnimations ? {} : { opacity: 0 }}
                            animate={disableAnimations ? {} : { opacity: 1 }}
                            exit={disableAnimations ? {} : { opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                            aria-hidden="true"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-10 pointer-events-none">
                            <motion.div
                                ref={containerRef}
                                role="dialog"
                                aria-modal="true"
                                aria-label={isRTL ? "عرض سريع للمنتج" : "Quick view product"}
                                initial={disableAnimations ? {} : { opacity: 0, scale: 0.95, y: 20 }}
                                animate={disableAnimations ? {} : { opacity: 1, scale: 1, y: 0 }}
                                exit={disableAnimations ? {} : { opacity: 0, scale: 0.95, y: 20 }}
                                className="pointer-events-auto relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] shadow-2xl md:flex-row"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-[var(--wide-neon)] hover:text-black"
                                    aria-label="Close modal"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Image Gallery Area */}
                                <div className="relative h-64 w-full bg-[var(--wide-bg-primary)] md:h-auto md:w-1/2">
                                    {/* current media */}
                                    {media[galleryIndex]?.type === "video" ? (
                                        <video
                                            src={media[galleryIndex].src}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="absolute inset-0 h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Image
                                            src={media[galleryIndex]?.src || "/products/IMG_0575.jpg"}
                                            alt={name}
                                            fill
                                            loading="lazy"
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    )}

                                    {product.badge && (
                                        <div className="absolute left-4 top-4 rounded-full bg-[var(--wide-neon)] px-3 py-1 text-xs font-bold text-black shadow-[0_0_10px_rgba(57,255,20,0.5)]">
                                            {product.badge}
                                        </div>
                                    )}

                                    {/* navigation arrows */}
                                    {media.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setGalleryIndex((i) => Math.max(i - 1, 0))}
                                                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                                                aria-label="Previous"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setGalleryIndex((i) => Math.min(i + 1, media.length - 1))}
                                                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                                                aria-label="Next"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Details Area */}
                                <div className="flex w-full flex-col overflow-y-auto p-6 md:w-1/2 md:p-8">
                                    {/* Header */}
                                    <div className="mb-4">
                                        <h2 className="text-2xl font-black text-[var(--wide-text-primary)]">{name}</h2>
                                        <div className="mt-2 flex items-end gap-3">
                                            <span className="text-2xl font-bold text-[var(--wide-neon)]">
                                                {formatPrice(currentPrice)}
                                            </span>
                                            {product.sale_price && (
                                                <span className="text-lg text-[var(--wide-text-muted)] line-through">
                                                    {formatPrice(product.price)}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => toggleWish(product.id)}
                                                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                                                aria-label={isWish ? (isRTL ? "إزالة من المفضلة" : "Remove from wishlist") : (isRTL ? "أضف للمفضلة" : "Add to wishlist")}
                                                role="button"
                                            >
                                                <Heart className={`h-4 w-4 ${isWish ? "fill-current" : ""}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="mb-6 text-sm leading-relaxed text-[var(--wide-text-secondary)]">
                                        {desc || (isRTL ? "قطعة أساسية في دولابك، مصممة عشان تديك أقصى درجات الراحة والستايل الأوفرسايز العصري." : "An essential piece for your wardrobe, designed to provide maximum comfort and a modern oversized style.")}
                                    </p>

                                    {/* Selection Area */}
                                    <div className="space-y-6">
                                        {/* Colors */}
                                        {product.colors && product.colors.length > 0 && (
                                            <div>
                                                <div className="mb-2 flex items-center justify-between text-sm">
                                                    <span className="font-medium text-[var(--wide-text-primary)]">{isRTL ? "اللون" : "Color"}</span>
                                                    <span className="text-[var(--wide-text-muted)]">{selectedColor}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    {product.colors.map((color) => (
                                                        <button
                                                            key={color.name}
                                                            onClick={() => setSelectedColor(color.name)}
                                                            className={`h-8 w-8 rounded-full border-2 transition-all ${selectedColor === color.name ? "border-[var(--wide-neon)] scale-110 shadow-[0_0_10px_rgba(57,255,20,0.3)]" : "border-transparent"}`}
                                                            style={{ backgroundColor: color.hex }}
                                                            title={color.name}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sizes */}
                                        {product.sizes && product.sizes.length > 0 && (
                                            <div>
                                                <div className="mb-2 flex items-center justify-between text-sm">
                                                    <span className="font-medium text-[var(--wide-text-primary)]">{isRTL ? "المقاس" : "Size"}</span>
                                                    <button
                                                        onClick={() => setShowSizeGuide(true)}
                                                        className="flex items-center gap-1 text-[var(--wide-text-muted)] transition-colors hover:text-[var(--wide-neon)]"
                                                    >
                                                        <Ruler className="h-4 w-4" />
                                                        {t("sizeGuide")}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {product.sizes.map((size) => (
                                                        <button
                                                            key={size}
                                                            onClick={() => setSelectedSize(size)}
                                                            className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium transition-all ${selectedSize === size
                                                                ? "border-[var(--wide-neon)] bg-[var(--wide-neon)]/10 text-[var(--wide-neon)] shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                                                                : "border-[var(--wide-border)] bg-[var(--wide-bg-primary)] text-[var(--wide-text-secondary)] hover:border-[var(--wide-text-muted)]"
                                                                }`}
                                                        >
                                                            {size}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Area */}
                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-sm font-medium text-[var(--wide-text-primary)]">{t("quantity")}</span>
                                            <div className="flex h-12 w-32 items-center justify-between rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-2">
                                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--wide-text-secondary)] transition-colors hover:bg-[var(--wide-surface)]" aria-label="Decrease quantity">
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="font-semibold text-[var(--wide-text-primary)]">{quantity}</span>
                                                <button onClick={() => setQuantity(quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--wide-text-secondary)] transition-colors hover:bg-[var(--wide-surface)]" aria-label="Increase quantity">
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleAddToCart}
                                            disabled={product.stock === 0 || (product.sizes?.length > 0 && !selectedSize)}
                                            className="shimmer-effect flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--wide-neon)] font-bold text-black disabled:opacity-50 sm:flex-none sm:px-8"
                                        >
                                            <ShoppingBag className="h-5 w-5" />
                                            {product.stock === 0 ? t("outOfStock") : t("addToCart")}
                                        </button>
                                    </div>

                                    {/* View Full Details Link */}
                                    <div className="mt-6 border-t border-[var(--wide-border)] pt-4 text-center">
                                        <a href={`/${locale}/products/${product.id}`} className="inline-flex items-center gap-2 text-sm text-[var(--wide-text-muted)] transition-colors hover:text-[var(--wide-neon)]">
                                            {isRTL ? "تفاصيل المنتج الكاملة" : "View Full Details"}
                                            {isRTL ? <ExternalLink className="h-3 w-3 -scale-x-100" /> : <ExternalLink className="h-3 w-3" />}
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            <SizeGuideModal
                isOpen={showSizeGuide}
                onClose={() => setShowSizeGuide(false)}
                category={product?.category as any || 'hoodie'}
            />
        </>
    );
}
