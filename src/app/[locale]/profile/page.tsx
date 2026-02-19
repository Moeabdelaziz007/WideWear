"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { User, Package, LogOut, Save, Loader2, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/providers/CartProvider";
import Navbar from "@/components/layout/Navbar";

export default function ProfilePage() {
    const t = useTranslations("auth");
    const locale = useLocale();
    const router = useRouter();
    const isRTL = locale === "ar";
    const { user } = useCart();
    const supabase = useMemo(() => createClient(), []);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address1, setAddress1] = useState("");
    const [city, setCity] = useState("Cairo");

    useEffect(() => {
        if (!user) { router.push(`/${locale}/auth`); return; }
        const fetchProfile = async () => {
            const { data } = await supabase
                .from("profiles")
                .select("full_name, phone, address_line1, city")
                .eq("id", user.id)
                .single();
            if (data) {
                setFullName(data.full_name || "");
                setPhone(data.phone || "");
                setAddress1(data.address_line1 || "");
                setCity(data.city || "Cairo");
            }
            setLoading(false);
        };
        fetchProfile();
    }, [user, router, locale, supabase]); // supabase is now stable via useMemo

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        await supabase.from("profiles").update({
            full_name: fullName,
            phone,
            address_line1: address1,
            city,
        }).eq("id", user.id);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push(`/${locale}`);
        router.refresh();
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[var(--wide-bg-primary)] pt-20 pb-12">
                <div className="mx-auto max-w-lg px-4">
                    <button onClick={() => router.push(`/${locale}`)} className="mb-6 flex items-center gap-2 text-sm text-[var(--wide-text-muted)] hover:text-[var(--wide-neon)]">
                        <ArrowLeft className="h-4 w-4" />
                        {isRTL ? "الرئيسية" : "Home"}
                    </button>

                    <h1 className="mb-8 text-3xl font-black text-[var(--wide-text-primary)]">{t("profile")}</h1>

                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[var(--wide-neon)]" /></div>
                    ) : (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            {/* Avatar */}
                            <div className="mb-8 flex flex-col items-center gap-3">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--wide-neon)]/10 text-[var(--wide-neon)]">
                                    <User className="h-10 w-10" />
                                </div>
                                <p className="text-sm text-[var(--wide-text-muted)]">{user?.email}</p>
                            </div>

                            {/* Form */}
                            <div className="space-y-4 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-6">
                                <div>
                                    <label htmlFor="profile-fullname" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{isRTL ? "الاسم بالكامل" : "Full Name"}</label>
                                    <input id="profile-fullname" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                </div>
                                <div>
                                    <label htmlFor="profile-phone" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{isRTL ? "رقم الموبايل" : "Phone"}</label>
                                    <input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                </div>
                                <div>
                                    <label htmlFor="profile-address" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{isRTL ? "العنوان" : "Address"}</label>
                                    <input id="profile-address" type="text" value={address1} onChange={(e) => setAddress1(e.target.value)} className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                </div>
                                <div>
                                    <label htmlFor="profile-city" className="mb-1.5 block text-xs font-medium text-[var(--wide-text-muted)]">{isRTL ? "المدينة" : "City"}</label>
                                    <input id="profile-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-4 py-3 text-sm text-[var(--wide-text-primary)] outline-none focus:border-[var(--wide-neon)]" />
                                </div>

                                <button onClick={handleSave} disabled={saving} className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all ${saved ? "bg-green-500 text-white" : "bg-[var(--wide-neon)] text-black"}`}>
                                    {saving ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : saved ? "✅" : (
                                        <span className="flex items-center justify-center gap-2"><Save className="h-4 w-4" /> {isRTL ? "حفظ" : "Save"}</span>
                                    )}
                                </button>
                            </div>

                            {/* Quick Links */}
                            <a href={`/${locale}/orders`} className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] p-4 transition-all hover:border-[var(--wide-neon-dim)]">
                                <Package className="h-5 w-5 text-[var(--wide-neon)]" />
                                <span className="flex-1 text-sm font-medium text-[var(--wide-text-primary)]">{t("myOrders")}</span>
                            </a>

                            {/* Sign Out */}
                            <button onClick={handleSignOut} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 py-3.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10">
                                <LogOut className="h-4 w-4" />
                                {t("signOut")}
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </>
    );
}
