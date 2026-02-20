"use client";

import { useTranslations, useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ShoppingBag, Menu, X, Globe, User, Sun, Moon, Zap } from "lucide-react";
import WideWearLogo from "@/components/brand/WideWearLogo";
import CartDrawer from "@/components/cart/CartDrawer";
import { useCart } from "@/components/providers/CartProvider";
import { OmniSearch } from "@/components/layout/OmniSearch";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function Navbar() {
    const t = useTranslations();
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [shrunk, setShrunk] = useState(false);

    // shrink navbar on scroll mobile/tablet
    useEffect(() => {
        const handleScroll = () => {
            setShrunk(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const currentLocale = useLocale();
    const isRTL = currentLocale === "ar";
    const { count, user } = useCart();
    const { theme, toggleTheme, performanceMode, togglePerformanceMode } = useTheme();
    const reduceMotion = useReducedMotion();
    const disableAnimations = performanceMode || reduceMotion;
    const searchParams = useSearchParams();

    const toggleLocale = () => {
        const newLocale = currentLocale === "ar" ? "en" : "ar";
        // preserve path after locale
        let path = pathname;
        if (path.startsWith(`/${currentLocale}`)) {
            path = `/${newLocale}` + path.slice(currentLocale.length + 1);
        }
        const search = searchParams.toString();
        const query = search ? `?${search}` : "";
        const hash = window.location.hash || "";
        router.push(path + query + hash);
    };

    const navLinks = [
        { label: t("nav.home"), href: `/${currentLocale}` },
        { label: t("nav.shop"), href: `/${currentLocale}/shop` },
        { label: t("nav.collections"), href: `/${currentLocale}/collections` },
        { label: t("nav.about"), href: `/${currentLocale}/about` },
    ];

    return (
        <>
            <nav className={`${shrunk ? "h-12" : "h-16"} fixed top-0 left-0 right-0 z-40 glass transition-all duration-300`}> 
                <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

                        {/* Theme Toggle */}
                        <motion.button
                            onClick={toggleTheme}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wide-surface)] text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-neon)]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
                        </motion.button>

                        {/* Performance Mode Toggle */}
                        <motion.button
                            onClick={togglePerformanceMode}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wide-surface)] text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-neon)]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={performanceMode ? "Disable performance mode" : "Enable performance mode"}
                            title={performanceMode ? "Performance mode ON" : "Performance mode OFF"}
                        >
                            <Zap className="h-4.5 w-4.5" />
                        </motion.button>

                        {/* Locale Toggle */}
                        <motion.button
                            onClick={toggleLocale}
                            className="flex h-9 items-center gap-1.5 rounded-full bg-[var(--wide-surface)] px-3 text-xs font-medium text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-neon)]"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={isRTL ? "Switch to English" : "التبديل إلى العربية"}
                            role="button"
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
                            aria-label={user ? t("auth.myAccount") : t("auth.signIn")}
                            role="button"
                        >
                            <User className="h-4.5 w-4.5" />
                        </motion.a>

                        {/* Cart */}
                        <motion.button
                            onClick={() => setCartOpen(true)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--wide-surface)] text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-neon)]"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={isRTL ? "عرض السلة" : "View cart"}
                            role="button"
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
                            aria-label={isOpen ? (isRTL ? "إغلاق القائمة" : "Close menu") : (isRTL ? "فتح القائمة" : "Open menu")}
                            role="button"
                        >
                            {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={disableAnimations ? {} : { opacity: 0, height: 0 }}
                            animate={disableAnimations ? {} : { opacity: 1, height: "auto" }}
                            exit={disableAnimations ? {} : { opacity: 0, height: 0 }}
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
