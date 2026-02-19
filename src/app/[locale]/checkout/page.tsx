"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Package, MapPin, CreditCard, Minus, Plus, Trash2, Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Turnstile } from "@marsidev/react-turnstile";
import { useCart } from "@/components/providers/CartProvider";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
    const t = useTranslations("checkout");
    const tc = useTranslations("cart");
    const locale = useLocale();
    const router = useRouter();
    const isRTL = locale === "ar";
    const { items, total, user, updateQuantity, removeItem } = useCart();

    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

    // Fallback sitekey for testing if env var not set
    const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    // Shipping form state
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address1, setAddress1] = useState("");
    const [address2, setAddress2] = useState("");
    const [city, setCity] = useState("Cairo");
    const [notes, setNotes] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod"); // 'cod' or 'fawry'

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            router.push(`/${locale}/auth`);
        }
    }, [user, router, locale]);

    // Pre-fill from profile
    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const supabase = createClient();
            const { data } = await supabase
                .from("profiles")
                .select("full_name, phone, address_line1, address_line2, city")
                .eq("id", user.id)
                .single();
            if (data) {
                setFullName(data.full_name || "");
                setPhone(data.phone || "");
                setAddress1(data.address_line1 || "");
                setAddress2(data.address_line2 || "");
                setCity(data.city || "Cairo");
            }
        };
        fetchProfile();
    }, [user]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-EG", {
            style: "currency",
            currency: "EGP",
            maximumFractionDigits: 0,
        }).format(price);

    const handlePlaceOrder = async () => {
        if (!turnstileToken) {
            setError(isRTL ? "يرجى التحقق من أمان الاتصال أولاً." : "Please verify security check first.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    phone,
                    address1,
                    address2,
                    city,
                    notes,
                    paymentMethod, // Dynamic now
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // If Fawry, redirect to Fawry Sandbox (Or wait for backend to return URL in next step)
            if (paymentMethod === "fawry") {
                // Placeholder redirect: In reality the API /orders would return a checkout URL
                // We will implement the actual charge request generation in the next step
                console.log("Redirecting to Fawry with Order ID:", data.orderId);
            }

            router.push(`/${locale}/checkout/success?orderId=${data.orderId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: t("step1"), icon: Package },
        { num: 2, label: t("step2"), icon: MapPin },
        { num: 3, label: t("step3"), icon: CreditCard },
    ];

    if (items.length === 0 && step === 1) {
        return (
            <>
                <Navbar />
                <div className="flex min-h-screen items-center justify-center bg-[var(--wide-bg-primary)] pt-16">
                    <div className="text-center">
                        <Package className="mx-auto mb-4 h-16 w-16 text-[var(--wide-text-muted)]" />
                        <h2 className="text-xl font-bold text-[var(--wide-text-primary)]">{tc("empty")}</h2>
                        <p className="mt-2 text-sm text-[var(--wide-text-muted)]">{tc("emptyDesc")}</p>
                        <a href={`/${locale}`} className="mt-4 inline-block rounded-xl bg-[var(--wide-neon)] px-6 py-3 text-sm font-bold text-black">
                            {tc("continueShopping")}
                        </a>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[var(--wide-bg-primary)] pt-20 pb-12">
                <div className="mx-auto max-w-5xl px-4">
                    {/* Header */}
                    <h1 className="mb-8 text-3xl font-black text-[var(--wide-text-primary)]">{t("title")}</h1>

                    {/* Step Indicator */}
                    <div className="mb-10 flex items-center justify-center gap-2">
                        {steps.map(({ num, label, icon: Icon }, i) => (
                            <div key={num} className="flex items-center gap-2">
                                <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${step >= num
                                    ? "bg-[var(--wide-neon)] text-black"
                                    : "bg-[var(--wide-surface)] text-[var(--wide-text-muted)]"
                                    }`}>
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`h-px w-8 transition-all ${step > num ? "bg-[var(--wide-neon)]" : "bg-[var(--wide-border)]"}`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <AnimatePresence mode="wait">
                                {/* Step 1: Review Cart */}
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="space-y-4">
                                            {items.map((item) => {
                                                const name = locale === "ar" ? item.product?.name_ar : item.product?.name_en;
                                                const price = item.product?.sale_price ?? item.product?.price ?? 0;
                                                return (
                                                    <div key={item.id} className="flex gap-4 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-4">
                                                        <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg">
                                                            <Image src={item.product?.images?.[0] ?? "/products/IMG_0575.jpg"} alt={name ?? ""} fill className="object-cover" sizes="80px" />
                                                        </div>
                                                        <div className="flex flex-1 flex-col justify-between">
                                                            <div>
                                                                <h3 className="font-semibold text-[var(--wide-text-primary)]">{name}</h3>
                                                                <p className="mt-1 text-xs text-[var(--wide-text-muted)]">{item.size} {item.color && `• ${item.color}`}</p>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--wide-surface)] text-[var(--wide-text-muted)]" title={isRTL ? "تقليل" : "Decrease"}>
                                                                        <Minus className="h-3 w-3" />
                                                                    </button>
                                                                    <span className="w-6 text-center text-sm font-medium text-[var(--wide-text-primary)]">{item.quantity}</span>
                                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--wide-surface)] text-[var(--wide-text-muted)]" title={isRTL ? "زيادة" : "Increase"}>
                                                                        <Plus className="h-3 w-3" />
                                                                    </button>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="font-bold text-[var(--wide-neon)]">{formatPrice(price * item.quantity)}</span>
                                                                    <button onClick={() => removeItem(item.id)} className="text-[var(--wide-text-muted)] hover:text-red-400" title={isRTL ? "حذف" : "Remove"}>
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <button onClick={() => setStep(2)} className="mt-6 w-full rounded-xl bg-[var(--wide-neon)] py-3.5 text-sm font-bold text-black">
                                            {t("next")} {isRTL ? <ArrowLeft className="ml-2 inline h-4 w-4" /> : <ArrowRight className="ml-2 inline h-4 w-4" />}
                                        </button>
                                    </motion.div>
                                )}

                                {/* Step 2: Shipping Info */}
                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="space-y-4 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-6">
                                            <div>
                                                <label htmlFor="checkout-fullname" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{t("fullName")} *</label>
                                                <input id="checkout-fullname" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                            </div>
                                            <div>
                                                <label htmlFor="checkout-phone" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{t("phone")} *</label>
                                                <input id="checkout-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" required className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                            </div>
                                            <div>
                                                <label htmlFor="checkout-addr1" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{t("address1")} *</label>
                                                <input id="checkout-addr1" type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} required className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                            </div>
                                            <div>
                                                <label htmlFor="checkout-addr2" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{t("address2")}</label>
                                                <input id="checkout-addr2" type="text" value={address2} onChange={(e) => setAddress2(e.target.value)} className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                            </div>
                                            <div>
                                                <label htmlFor="checkout-city" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{t("city")}</label>
                                                <input id="checkout-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                            </div>
                                            <div>
                                                <label htmlFor="checkout-notes" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{t("notes")}</label>
                                                <textarea id="checkout-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                            </div>
                                        </div>
                                        <div className="mt-6 flex gap-3">
                                            <button onClick={() => setStep(1)} className="flex-1 rounded-xl border border-[var(--wide-border)] py-3.5 text-sm font-medium text-[var(--wide-text-secondary)]">
                                                {t("back")}
                                            </button>
                                            <button onClick={() => { if (fullName && phone && address1) setStep(3); }} className="flex-1 rounded-xl bg-[var(--wide-neon)] py-3.5 text-sm font-bold text-black disabled:opacity-50" disabled={!fullName || !phone || !address1}>
                                                {t("next")}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Confirm */}
                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                        <div className="space-y-4 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-6">
                                            <h3 className="flex items-center gap-2 font-semibold text-[var(--wide-text-primary)]">
                                                <MapPin className="h-4 w-4 text-[var(--wide-neon)]" />
                                                {t("step2")}
                                            </h3>
                                            <div className="rounded-lg bg-[var(--wide-bg-primary)] p-4 text-sm text-[var(--wide-text-secondary)]">
                                                <p className="font-medium text-[var(--wide-text-primary)]">{fullName}</p>
                                                <p>{phone}</p>
                                                <p>{address1}{address2 && `, ${address2}`}</p>
                                                <p>{city}</p>
                                                {notes && <p className="mt-2 italic text-[var(--wide-text-muted)]">{notes}</p>}
                                            </div>

                                            <h3 className="flex items-center gap-2 font-semibold text-[var(--wide-text-primary)]">
                                                <CreditCard className="h-4 w-4 text-[var(--wide-neon)]" />
                                                {t("paymentMethod")}
                                            </h3>

                                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                {/* Cash on Delivery */}
                                                <button
                                                    onClick={() => setPaymentMethod("cod")}
                                                    className={`group relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${paymentMethod === "cod"
                                                        ? "border-[var(--wide-neon)] bg-[var(--wide-neon)]/5 ring-1 ring-[var(--wide-neon)]"
                                                        : "border-[var(--wide-border)] bg-[var(--wide-bg-primary)] hover:border-[var(--wide-text-muted)]"
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-all ${paymentMethod === "cod" ? "border-[var(--wide-neon)]" : "border-[var(--wide-text-muted)]"}`}>
                                                        {paymentMethod === "cod" && <div className="h-2.5 w-2.5 rounded-full bg-[var(--wide-neon)]" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-semibold transition-colors ${paymentMethod === "cod" ? "text-[var(--wide-text-primary)]" : "text-[var(--wide-text-muted)]"}`}>
                                                                {t("cod")}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-xs text-[var(--wide-text-secondary)]">
                                                            {isRTL ? "الدفع نقداً عند استلام الطلب" : "Pay with cash upon delivery"}
                                                        </p>
                                                    </div>
                                                </button>

                                                {/* Fawry Pay */}
                                                <button
                                                    onClick={() => setPaymentMethod("fawry")}
                                                    className={`group relative flex items-center gap-4 rounded-xl border p-4 text-left transition-all ${paymentMethod === "fawry"
                                                        ? "border-[#FDBD12] bg-[#FDBD12]/5 ring-1 ring-[#FDBD12]" // Fawry Yellow
                                                        : "border-[var(--wide-border)] bg-[var(--wide-bg-primary)] hover:border-[var(--wide-text-muted)]"
                                                        }`}
                                                >
                                                    <div className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border transition-all ${paymentMethod === "fawry" ? "border-[#FDBD12]" : "border-[var(--wide-text-muted)]"}`}>
                                                        {paymentMethod === "fawry" && <div className="h-2.5 w-2.5 rounded-full bg-[#FDBD12]" />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-semibold transition-colors ${paymentMethod === "fawry" ? "text-[var(--wide-text-primary)]" : "text-[var(--wide-text-muted)]"}`}>
                                                                {isRTL ? "فوري باي" : "Fawry Pay"}
                                                            </span>
                                                            <div className="flex rounded bg-white px-1 py-0.5 shadow-sm">
                                                                {/* Simple Fawry text logo simulation since we don't have SVG */}
                                                                <span className="text-[10px] font-black tracking-tight text-[#004A8F]">fawry</span><span className="text-[10px] font-black tracking-tight text-[#FDBD12]">Pay</span>
                                                            </div>
                                                        </div>
                                                        <p className="mt-1 text-xs text-[var(--wide-text-secondary)]">
                                                            {isRTL ? "دفع آمن بالبطاقة أو المحافظ أو امان" : "Secure card, wallet, or kiosk payments"}
                                                        </p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Turnstile Security Check */}
                                        <div className="flex justify-center py-4">
                                            <Turnstile
                                                siteKey={turnstileSiteKey}
                                                onSuccess={(token) => setTurnstileToken(token)}
                                                onError={() => setError("Security check failed. Please refresh.")}
                                                onExpire={() => setTurnstileToken(null)}
                                            />
                                        </div>

                                        <div className="mt-6 flex gap-3">
                                            <button onClick={() => setStep(2)} className="flex-1 rounded-xl border border-[var(--wide-border)] py-3.5 text-sm font-medium text-[var(--wide-text-secondary)]">
                                                {t("back")}
                                            </button>
                                            <button onClick={handlePlaceOrder} disabled={loading} className="shimmer-effect flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--wide-neon)] py-3.5 text-sm font-bold text-black disabled:opacity-50">
                                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("placeOrder")}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-5">
                                <h3 className="mb-4 font-semibold text-[var(--wide-text-primary)]">{t("orderSummary")}</h3>
                                <div className="space-y-3">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-[var(--wide-text-secondary)] line-clamp-1">
                                                {locale === "ar" ? item.product?.name_ar : item.product?.name_en} × {item.quantity}
                                            </span>
                                            <span className="text-[var(--wide-text-primary)]">
                                                {formatPrice((item.product?.sale_price ?? item.product?.price ?? 0) * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <div className="my-4 h-px bg-[var(--wide-border)]" />
                                <div className="flex justify-between text-sm text-[var(--wide-text-muted)]">
                                    <span>{tc("shipping")}</span>
                                    <span className="text-[var(--wide-neon)]">{tc("freeShipping")}</span>
                                </div>
                                <div className="mt-3 flex justify-between border-t border-[var(--wide-border)] pt-3">
                                    <span className="font-bold text-[var(--wide-text-primary)]">{tc("total")}</span>
                                    <span className="text-lg font-bold text-[var(--wide-neon)]">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
