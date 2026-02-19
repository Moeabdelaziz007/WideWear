"use client";

import { motion } from "framer-motion";
import { Gift, Truck, Sparkles } from "lucide-react";

export default function PromoMarquee() {
    const items = [
        { icon: Gift, text: "Buy 2, Get 1 FREE 🎁" },
        { icon: Truck, text: "Free Delivery in Cairo 🚚" },
        { icon: Sparkles, text: "Ramadan Collection 2026 ✨" },
        { icon: Gift, text: "اشتري ٢ والتالتة هدية 🎁" },
        { icon: Truck, text: "توصيل مجاني في القاهرة 🚚" },
        { icon: Sparkles, text: "مجموعة رمضان ٢٠٢٦ ✨" },
    ];

    return (
        <div className="relative overflow-hidden border-y border-[var(--wide-border)] bg-[var(--wide-dark)] py-3">
            <motion.div
                className="flex w-max gap-8"
                animate={{ x: [0, "-50%"] }}
                transition={{
                    x: {
                        duration: 30,
                        repeat: Infinity,
                        ease: "linear",
                    },
                }}
            >
                {[...items, ...items].map((item, i) => (
                    <div key={i} className="flex shrink-0 items-center gap-2 px-4">
                        <item.icon className="h-3.5 w-3.5 text-[var(--wide-neon)]" />
                        <span className="whitespace-nowrap text-xs font-semibold tracking-wide text-[var(--wide-text-secondary)]">
                            {item.text}
                        </span>
                        <span className="text-[var(--wide-border)]">•</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
