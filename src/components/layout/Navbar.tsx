"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Globe, User } from "lucide-react";
import WideWearLogo from "@/components/brand/WideWearLogo";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCart } from "@/components/providers/CartProvider";
import { OmniSearch } from "@/components/layout/OmniSearch";

export default function Navbar() {
    const t = useTranslations();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);

    const currentLocale = useLocale();
    const isRTL = currentLocale === "ar";
    const { count, user } = useCart();

    const toggleLocale = () => {
        const newLocale = currentLocale === "ar" ? "en" : "ar";
        const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
        router.push(newPath);
    };

    const navLinks = [
        { label: t("nav.home"), href: `/${currentLocale}` },
        { label: t("nav.shop"), href: `/${currentLocale}/shop` },
        { label: t("nav.collections"), href: `/${currentLocale}/collections` },
        { label: t("nav.about"), href: `/${currentLocale}/about` },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-40 glass">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <a href={`/${currentLocale}`} aria-label="WideWear Home">
                        <WideWearLogo size="sm" animated />
                    </a>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-8 md:flex">
                        {navLinks.map((link) => (
                            <motion.a
                                key={link.href}
                                href={link.href}
                                className="relative text-sm font-medium text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-text-primary)]"
                                whileHover={{ y: -2 }}
                            >
                                {link.label}
                                {pathname === link.href && (
                                    <motion.span
                                        layoutId="activeNav"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[var(--wide-neon)]"
                                    />
                                )}
                            </motion.a>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <OmniSearch />

                        {/* Locale Toggle */}
                        <motion.button
                            onClick={toggleLocale}
                            className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--wide-surface)] px-3 text-xs font-medium text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-neon)]"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Globe className="h-3.5 w-3.5" />
                            {currentLocale === "ar" ? "EN" : "عربي"}
                        </motion.button>

                        {/* User / Auth */}
                        <motion.a
                            href={user ? `/${currentLocale}/profile` : `/${currentLocale}/auth`}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wide-surface)] text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-neon)]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title={user ? t("auth.myAccount") : t("auth.signIn")}
                        >
                            <User className="h-4.5 w-4.5" />
                        </motion.a>

                        {/* Cart */}
                        <motion.button
                            onClick={() => setCartOpen(true)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wide-surface)] text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-neon)]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ShoppingBag className="h-4.5 w-4.5" />
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--wide-neon)] text-[10px] font-bold text-black">
                                {count}
                            </span>
                        </motion.button>

                        {/* Mobile Menu Toggle */}
                        <motion.button
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wide-surface)] text-[var(--wide-text-secondary)] md:hidden"
                            onClick={() => setIsOpen(!isOpen)}
                            whileTap={{ scale: 0.9 }}
                        >
                            {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="glass overflow-hidden border-t border-[var(--wide-border)] md:hidden"
                        >
                            <div className="flex flex-col gap-1 px-4 py-4">
                                {navLinks.map((link, i) => (
                                    <motion.a
                                        key={link.href}
                                        href={link.href}
                                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--wide-text-secondary)] transition-colors hover:bg-[var(--wide-surface)] hover:text-[var(--wide-text-primary)]"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </motion.a>
                                ))}

                                {/* Mobile Auth Link */}
                                <motion.a
                                    href={user ? `/${currentLocale}/profile` : `/${currentLocale}/auth`}
                                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: navLinks.length * 0.05 }}
                                    className="rounded-lg px-4 py-3 text-sm font-medium text-[var(--wide-neon)] transition-colors hover:bg-[var(--wide-surface)]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {user ? t("auth.myAccount") : t("auth.signIn")}
                                </motion.a>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Cart Drawer */}
            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
