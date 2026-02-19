"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Facebook, Instagram, Send } from "lucide-react";
import WideWearLogo from "@/components/brand/WideWearLogo";

export default function Footer() {
    const t = useTranslations();

    const telegramBot = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "WideWear_Bot";

    return (
        <footer className="border-t border-[var(--wide-border)] bg-[var(--wide-dark)]">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Column */}
                    <div className="flex flex-col gap-4">
                        <WideWearLogo size="md" animated={false} />
                        <p className="text-sm leading-relaxed text-[var(--wide-text-secondary)]">
                            {t("brand.tagline")}
                            <br />
                            <span className="text-[var(--wide-text-muted)]">{t("brand.since")}</span>
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-[var(--wide-text-muted)]">
                            Quick Links
                        </h4>
                        {["home", "shop", "collections", "about"].map((key) => (
                            <a
                                key={key}
                                href="#"
                                className="text-sm text-[var(--wide-text-secondary)] transition-colors hover:text-[var(--wide-neon)]"
                            >
                                {t(`nav.${key}`)}
                            </a>
                        ))}
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-[var(--wide-text-muted)]">
                            {t("footer.contactUs")}
                        </h4>
                        <p className="text-sm text-[var(--wide-text-secondary)]">
                            📍 Obour City & Golf City Mall
                        </p>
                        <p className="text-sm text-[var(--wide-text-secondary)]">
                            Cairo, Egypt 🇪🇬
                        </p>
                        <a
                            href={`https://t.me/${telegramBot}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-medium transition-colors"
                            style={{ color: "#2AABEE" }}
                        >
                            <Send className="h-4 w-4" />
                            Telegram Support
                        </a>
                    </div>

                    {/* Social */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-[var(--wide-text-muted)]">
                            {t("footer.followUs")}
                        </h4>
                        <div className="flex gap-3">
                            {[
                                { icon: Facebook, href: "https://facebook.com/WideWear", label: "Facebook" },
                                { icon: Instagram, href: "https://instagram.com/wide.wear0", label: "Instagram" },
                                { icon: Send, href: `https://t.me/${telegramBot}`, label: "Telegram" },
                            ].map(({ icon: Icon, href, label }) => (
                                <motion.a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.15, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--wide-border)] bg-[var(--wide-surface)] text-[var(--wide-text-secondary)] transition-colors hover:border-[var(--wide-neon)] hover:text-[var(--wide-neon)]"
                                    aria-label={label}
                                >
                                    <Icon className="h-4.5 w-4.5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--wide-border)] pt-8 text-center sm:flex-row sm:text-start">
                    <p className="text-xs text-[var(--wide-text-muted)]">
                        © 2026 WIDE Wear. {t("footer.rights")}.
                    </p>
                    <p className="text-xs text-[var(--wide-text-muted)]">
                        Powered by <span className="neon-text">Antigravity</span> ⚡
                    </p>
                </div>
            </div>
        </footer>
    );
}
