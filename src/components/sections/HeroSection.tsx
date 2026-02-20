"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowDown, Sparkles, Play, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

const HERO_IMAGES = [
    "/products/IMG_0580.jpg",
    "/products/IMG_0754.jpg",
    "/products/IMG_0737.jpg",
];

// Deterministic pseudo-random to avoid hydration mismatch
function seededRandom(seed: number) {
    const x = Math.sin(seed * 9301 + 49297) * 49297;
    return x - Math.floor(x);
}

export default function HeroSection() {
    const t = useTranslations();
    const [activeSlide, setActiveSlide] = useState(0);
    const [mounted, setMounted] = useState(false);
    const { performanceMode } = useTheme();
    const reduceMotion = useReducedMotion();
    const disableAnimations = performanceMode || reduceMotion;

    useEffect(() => {
        setMounted(true);
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const particles = useMemo(
        () =>
            Array.from({ length: 30 }).map((_, i) => ({
                left: seededRandom(i * 7 + 1) * 100,
                top: seededRandom(i * 7 + 2) * 100,
                size: seededRandom(i * 7 + 3) * 3 + 1,
                opacity: seededRandom(i * 7 + 4) * 0.4 + 0.05,
                yDist: -(seededRandom(i * 7 + 5) * 60 + 20),
                xDist: seededRandom(i * 7 + 6) * 20 - 10,
                duration: seededRandom(i * 7 + 7) * 5 + 4,
                delay: seededRandom(i * 7 + 8) * 3,
            })),
        []
    );

    return (
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
            {/* Background Hero Image Slideshow */}
            <div className="absolute inset-0">
                <AnimatePresence mode="sync">
                    <motion.div
                        key={activeSlide}
                        className="absolute inset-0"
                        initial={disableAnimations ? {} : { opacity: 0, scale: 1.1 }}
                        animate={disableAnimations ? {} : { opacity: 1, scale: 1 }}
                        exit={disableAnimations ? {} : { opacity: 0 }}
                        transition={disableAnimations ? {} : { duration: 1.5, ease: "easeInOut" }}
                    >
                        <Image
                            src={HERO_IMAGES[activeSlide]}
                            alt="WideWear Hero"
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Multi-layer overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--wide-black)]/80 via-[var(--wide-black)]/60 to-[var(--wide-black)]/90" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--wide-black)]/70 via-transparent to-[var(--wide-black)]/70" />

                {/* Neon scan line effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--wide-neon-glow)] to-transparent opacity-[0.03]"
                    animate={disableAnimations ? {} : { y: ["-100%", "100%"] }}
                    transition={disableAnimations ? {} : { duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{ height: "200%" }}
                />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `
              linear-gradient(var(--wide-neon) 1px, transparent 1px),
              linear-gradient(90deg, var(--wide-neon) 1px, transparent 1px)
            `,
                        backgroundSize: "80px 80px",
                    }}
                />

                {/* Floating Particles — deterministic for SSR hydration */}
                {!disableAnimations && mounted && particles.map((p, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            left: `${p.left}%`,
                            top: `${p.top}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: "var(--wide-neon)",
                            opacity: p.opacity,
                        }}
                        animate={{
                            y: [0, p.yDist, 0],
                            x: [0, p.xDist, 0],
                            opacity: [0.05, 0.5, 0.05],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            delay: p.delay,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center px-4 text-center">
                {/* Top Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="mb-8 flex items-center gap-2.5 rounded-full border border-[var(--wide-neon-dim)]/30 bg-[var(--wide-neon-glow)] px-5 py-2.5 shadow-[0_0_30px_rgba(57,255,20,0.1)]"
                >
                    <Sparkles className="h-4 w-4 text-[var(--wide-neon)]" />
                    <span className="text-sm font-semibold text-[var(--wide-neon)]">
                        {t("promo.ramadan")}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-[var(--wide-neon-dim)]" />
                    <span className="text-sm text-[var(--wide-text-secondary)]">
                        {t("brand.since")}
                    </span>
                </motion.div>

                {/* Main Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1, type: "spring", bounce: 0.4 }}
                    className="mb-4"
                >
                    <h1 className="text-6xl font-black leading-[0.85] tracking-tighter sm:text-[7rem] lg:text-[10rem] uppercase">
                        <span className="block text-white mix-blend-overlay opacity-90">
                            {t("hero.headline").split(".")[0] || "DEFINE YOUR"}
                        </span>
                        <span className="relative mt-0 inline-block">
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--wide-neon)] to-[#00ff88] drop-shadow-[0_0_30px_rgba(57,255,20,0.4)]">
                                {t("brand.name").toUpperCase() || "WIDEWEAR"}
                            </span>
                        </span>
                    </h1>
                </motion.div>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="mb-10 max-w-lg text-base text-[var(--wide-text-secondary)] sm:text-lg lg:text-xl"
                >
                    {t("hero.subheadline")}
                </motion.p>

                {/* CTA Group */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col items-center gap-4 sm:flex-row"
                >
                    {/* Primary CTA */}
                    <motion.button
                        whileHover={{
                            scale: 1.05,
                            boxShadow: "0 0 40px rgba(57, 255, 20, 0.35)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative overflow-hidden rounded-2xl bg-[var(--wide-neon)] px-10 py-4 text-sm font-bold uppercase tracking-wider text-black transition-all"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Play className="h-4 w-4 fill-current" />
                            {t("hero.cta")}
                        </span>
                        {/* Shimmer effect */}
                        <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        />
                    </motion.button>

                    {/* Secondary CTA */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="group flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-10 py-4 text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-[var(--wide-neon)]/50 hover:text-[var(--wide-neon)]"
                    >
                        {t("hero.explore")}
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.button>
                </motion.div>

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 }}
                    className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
                >
                    {[
                        { value: "47+", label: t("promo.ramadan").split(" ")[0] || "Ramadan" },
                        { value: "500+", label: "Happy Clients" },
                        { value: "24h", label: "Fast Delivery" },
                    ].map((stat, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-[var(--wide-neon)] sm:text-3xl">
                                {stat.value}
                            </span>
                            <span className="text-[10px] uppercase tracking-widest text-[var(--wide-text-muted)]">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </motion.div>

                {/* Slide Indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                    className="mt-10 flex items-center gap-2"
                >
                    {HERO_IMAGES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveSlide(i)}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === activeSlide
                                ? "w-8 bg-[var(--wide-neon)]"
                                : "w-1.5 bg-[var(--wide-text-muted)]"
                                }`}
                        />
                    ))}
                </motion.div>
            </div>

            {/* Scroll Down */}
            <motion.div
                className="absolute bottom-8 flex flex-col items-center gap-2"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
            >
                <ArrowDown className="h-5 w-5 text-[var(--wide-text-muted)]" />
            </motion.div>
        </section>
    );
}
