"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useLocale } from "next-intl";

const COLLECTIONS = [
    {
        id: 1,
        name: { ar: "مجموعة رمضان", en: "Ramadan Collection" },
        desc: { ar: "عبايات و أطقم مودرن", en: "Modern Abayas & Sets" },
        image: "/products/IMG_0580.jpg",
        count: 12,
        color: "from-amber-500/20 to-yellow-500/5",
    },
    {
        id: 2,
        name: { ar: "ستريت وير", en: "Streetwear Drop" },
        desc: { ar: "هوديز و سويتشيرتات", en: "Hoodies & Sweatshirts" },
        image: "/products/IMG_0737.jpg",
        count: 18,
        color: "from-emerald-500/20 to-green-500/5",
    },
    {
        id: 3,
        name: { ar: "لاونج وير", en: "Loungewear Edit" },
        desc: { ar: "أطقم مريحة للبيت", en: "Cozy Home Sets" },
        image: "/products/IMG_0754.jpg",
        count: 8,
        color: "from-pink-500/20 to-rose-500/5",
    },
];

export default function CollectionsShowcase() {
    const locale = useLocale();

    return (
        <section className="relative py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-12 flex items-end justify-between">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.3em] text-[var(--wide-neon)]"
                        >
                            {locale === "ar" ? "المجموعات" : "Collections"}
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl font-black sm:text-4xl"
                        >
                            {locale === "ar" ? "تسوّق حسب الستايل" : "Shop by Style"}
                        </motion.h2>
                    </div>
                </div>

                {/* Collections Grid - bento-style */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {COLLECTIONS.map((collection, i) => (
                        <motion.a
                            key={collection.id}
                            href="#"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className={`group relative flex flex-col overflow-hidden rounded-3xl border border-[var(--wide-border)]  ${i === 0 ? "sm:row-span-2" : ""
                                }`}
                        >
                            {/* Image */}
                            <div className={`relative w-full overflow-hidden ${i === 0 ? "aspect-[3/5]" : "aspect-[4/3]"}`}>
                                <Image
                                    src={collection.image}
                                    alt={locale === "ar" ? collection.name.ar : collection.name.en}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 640px) 100vw, 33vw"
                                />
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} via-transparent to-transparent`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-[var(--wide-text-secondary)]">
                                            {collection.count} {locale === "ar" ? "قطعة" : "items"}
                                        </p>
                                        <h3 className="mt-1 text-xl font-black text-white">
                                            {locale === "ar" ? collection.name.ar : collection.name.en}
                                        </h3>
                                        <p className="mt-0.5 text-sm text-[var(--wide-text-secondary)]">
                                            {locale === "ar" ? collection.desc.ar : collection.desc.en}
                                        </p>
                                    </div>
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 45 }}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all group-hover:border-[var(--wide-neon)] group-hover:bg-[var(--wide-neon)] group-hover:text-black"
                                    >
                                        <ArrowUpRight className="h-5 w-5" />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
