"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";
import { useLocale } from "next-intl";

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: "hoodie" | "jacket" | "pants" | "abaya" | "shoes" | "set";
}

// Dummy size data based on category
const SIZE_DATA = {
    hoodie: {
        headers: ["Size", "Chest (cm)", "Length (cm)", "Sleeve (cm)"],
        rows: [
            ["S", "58", "68", "62"],
            ["M", "60", "70", "63"],
            ["L", "62", "72", "64"],
            ["XL", "64", "74", "65"],
            ["XXL", "66", "76", "66"],
        ]
    },
    pants: {
        headers: ["Size", "Waist (cm)", "Length (cm)", "Hip (cm)"],
        rows: [
            ["S", "38", "102", "54"],
            ["M", "40", "104", "56"],
            ["L", "42", "106", "58"],
            ["XL", "44", "108", "60"],
        ]
    },
    shoes: {
        headers: ["EU", "US Men", "US Women", "Length (cm)"],
        rows: [
            ["40", "7", "8.5", "25.4"],
            ["41", "8", "9.5", "26.0"],
            ["42", "9", "10.5", "26.7"],
            ["43", "10", "11.5", "27.3"],
            ["44", "11", "12.5", "27.9"],
            ["45", "12", "13.5", "28.6"],
        ]
    },
    abaya: {
        headers: ["Size", "Length (in)", "Bust (in)"],
        rows: [
            ["S", "52", "40"],
            ["M", "54", "42"],
            ["L", "56", "44"],
            ["XL", "58", "46"],
        ]
    }
};

export default function SizeGuideModal({ isOpen, onClose, category }: SizeGuideModalProps) {
    const locale = useLocale();
    const isRTL = locale === "ar";

    // Fallback to hoodie sizes if category is set/jacket/accessory
    const data = SIZE_DATA[category as keyof typeof SIZE_DATA] || SIZE_DATA.hoodie;

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
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 py-20 overflow-y-auto pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-[var(--wide-border)] bg-[var(--wide-bg-primary)] p-5">
                                <div className="flex items-center gap-2">
                                    <Ruler className="h-5 w-5 text-[var(--wide-neon)]" />
                                    <h2 className="text-xl font-bold text-[var(--wide-text-primary)]">
                                        {isRTL ? "دليل المقاسات" : "Size Guide"} - <span className="capitalize">{category}</span>
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="rounded-full p-2 text-[var(--wide-text-muted)] transition-colors hover:bg-[var(--wide-surface)] hover:text-[var(--wide-neon)]"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="mb-6 rounded-lg bg-[var(--wide-neon-glow)] p-4 border border-[var(--wide-neon)]/30">
                                    <p className="text-sm text-[var(--wide-neon)]">
                                        {isRTL
                                            ? "نصيحة: كل منتجاتنا مصممة بقصة واسعة (Oversized). للحصول على المقاس العادي، اطلب مقاس أصغر."
                                            : "Tip: All our products feature an Oversized fit. For a standard fit, size down."}
                                    </p>
                                </div>

                                <div className="overflow-x-auto rounded-xl border border-[var(--wide-border)]">
                                    <table className="w-full text-left text-sm text-[var(--wide-text-secondary)]">
                                        <thead className="bg-[var(--wide-surface)] text-xs uppercase text-[var(--wide-text-primary)]">
                                            <tr>
                                                {data.headers.map((header, i) => (
                                                    <th key={i} className={`px-6 py-4 ${i === 0 ? "bg-[var(--wide-bg-primary)] font-bold text-[var(--wide-neon)]" : ""}`}>
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.rows.map((row, i) => (
                                                <tr key={i} className="border-b border-[var(--wide-border)] last:border-0 hover:bg-[var(--wide-surface)] transition-colors">
                                                    {row.map((cell, j) => (
                                                        <td key={j} className={`px-6 py-4 ${j === 0 ? "bg-[var(--wide-bg-primary)] font-bold text-white" : ""}`}>
                                                            {cell}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
