"use client";

import { motion } from "framer-motion";

interface WideWearLogoProps {
    size?: "sm" | "md" | "lg" | "xl";
    variant?: "full" | "icon";
    animated?: boolean;
    className?: string;
}

const SIZES = {
    sm: { width: 120, height: 32, fontSize: 18, orbitR: 40 },
    md: { width: 160, height: 40, fontSize: 24, orbitR: 52 },
    lg: { width: 220, height: 56, fontSize: 32, orbitR: 70 },
    xl: { width: 320, height: 80, fontSize: 48, orbitR: 100 },
};

export default function WideWearLogo({
    size = "md",
    variant = "full",
    animated = true,
    className = "",
}: WideWearLogoProps) {
    const s = SIZES[size];

    if (variant === "icon") {
        return (
            <motion.svg
                viewBox="0 0 48 48"
                width={s.height}
                height={s.height}
                className={className}
                whileHover={animated ? { rotate: 360 } : undefined}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                {/* Outer ring with neon glow */}
                <defs>
                    <filter id="neon-glow-icon">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                    </filter>
                    <linearGradient id="neon-grad-icon" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#39ff14" />
                        <stop offset="100%" stopColor="#00ff88" />
                    </linearGradient>
                </defs>
                {/* Glow ring */}
                <circle cx="24" cy="24" r="20" fill="none" stroke="url(#neon-grad-icon)" strokeWidth="1.5" opacity="0.3" filter="url(#neon-glow-icon)" />
                {/* Main ring */}
                <circle cx="24" cy="24" r="20" fill="none" stroke="url(#neon-grad-icon)" strokeWidth="1.5" />
                {/* W letter */}
                <text x="24" y="30" textAnchor="middle" fill="#39ff14" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="22">
                    W
                </text>
            </motion.svg>
        );
    }

    return (
        <motion.div
            className={`relative inline-flex items-center gap-1 ${className}`}
            whileHover={animated ? { scale: 1.03 } : undefined}
            whileTap={animated ? { scale: 0.97 } : undefined}
        >
            <svg
                viewBox="0 0 280 60"
                width={s.width}
                height={s.height}
                className="overflow-visible"
            >
                <defs>
                    {/* Neon glow filter */}
                    <filter id="neon-glow-text" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feFlood floodColor="#39ff14" floodOpacity="0.4" result="color" />
                        <feComposite in="color" in2="blur" operator="in" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    {/* Gradient for WIDE text */}
                    <linearGradient id="wide-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#39ff14" />
                        <stop offset="50%" stopColor="#2ecc0f" />
                        <stop offset="100%" stopColor="#00ff88" />
                    </linearGradient>
                    {/* Orbit ring gradient */}
                    <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#39ff14" stopOpacity="0.6" />
                        <stop offset="50%" stopColor="#39ff14" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#00ff88" stopOpacity="0.6" />
                    </linearGradient>
                </defs>

                {/* WIDE text with neon glow */}
                <text
                    x="8"
                    y="40"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontWeight="900"
                    fontSize={s.fontSize}
                    fill="url(#wide-gradient)"
                    filter="url(#neon-glow-text)"
                    letterSpacing="-1"
                    fontStyle="italic"
                >
                    WIDE
                </text>

                {/* Wear text */}
                <text
                    x={s.fontSize * 3.5 + 12}
                    y="40"
                    fontFamily="Inter, system-ui, sans-serif"
                    fontWeight="700"
                    fontSize={s.fontSize * 0.75}
                    fill="#f5f5f5"
                    letterSpacing="0"
                >
                    Wear
                </text>

                {/* Orbit ellipse around the brand name */}
                {animated && (
                    <>
                        {/* Main orbit ring */}
                        <ellipse
                            cx="140"
                            cy="30"
                            rx={s.orbitR * 1.8}
                            ry={s.orbitR * 0.35}
                            fill="none"
                            stroke="url(#orbit-grad)"
                            strokeWidth="1"
                            opacity="0.5"
                            transform="rotate(-8, 140, 30)"
                        />
                        {/* Orbiting dot */}
                        <motion.circle
                            r="2.5"
                            fill="#39ff14"
                            filter="url(#neon-glow-text)"
                            animate={{
                                cx: [140 + s.orbitR * 1.8, 140, 140 - s.orbitR * 1.8, 140, 140 + s.orbitR * 1.8],
                                cy: [30, 30 - s.orbitR * 0.35, 30, 30 + s.orbitR * 0.35, 30],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    </>
                )}
            </svg>
        </motion.div>
    );
}
