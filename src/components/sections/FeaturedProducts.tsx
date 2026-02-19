"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Star, TrendingUp, Truck, Shield, Zap, Heart, ShoppingBag, Eye } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const PRODUCTS = [
  {
    id: 1,
    name: { ar: "فستان تاي دي - رملي", en: "Tie-Dye Ribbed Dress – Sand" },
    price: 899,
    oldPrice: 1299,
    image: "/products/IMG_0575.jpg",
    badge: "NEW",
    rating: 4.8,
    reviews: 24,
    colors: ["#a89272", "#5a6b5a"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: { ar: "فستان تريكو كيبل - بينك", en: "Cable-Knit Dress – Blush Pink" },
    price: 1199,
    oldPrice: 1699,
    image: "/products/IMG_0579.jpg",
    badge: "HOT",
    rating: 4.9,
    reviews: 38,
    colors: ["#c4a0a0", "#e8d5c4"],
    sizes: ["S", "M", "L"],
  },
  {
    id: 3,
    name: { ar: "فستان سويد - بيج", en: "Suede A-Line Dress – Beige" },
    price: 1049,
    oldPrice: null,
    image: "/products/IMG_0580.jpg",
    badge: "EXCLUSIVE",
    rating: 5.0,
    reviews: 12,
    colors: ["#c4ad8c"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 4,
    name: { ar: "سويتشيرت ليوبارد ميني", en: "Leopard Minnie Sweatshirt" },
    price: 749,
    oldPrice: 999,
    image: "/products/IMG_0737.jpg",
    badge: null,
    rating: 4.7,
    reviews: 56,
    colors: ["#5a4a3a", "#3a3a3a"],
    sizes: ["M", "L", "XL", "XXL"],
  },
  {
    id: 5,
    name: { ar: "سويتشيرت هيلو كيتي - أسود", en: "Hello Kitty Sweatshirt – Washed Black" },
    price: 699,
    oldPrice: 899,
    image: "/products/IMG_0744.jpg",
    badge: "SALE",
    rating: 4.6,
    reviews: 41,
    colors: ["#3d3d3d", "#f0f0f0"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    id: 6,
    name: { ar: "سويتشيرت باريس ميني", en: "Paris Minnie Sweatshirt" },
    price: 649,
    oldPrice: null,
    image: "/products/IMG_0751.jpg",
    badge: "RAMADAN",
    rating: 4.8,
    reviews: 19,
    colors: ["#e8d5c4", "#8b2252"],
    sizes: ["M", "L", "XL"],
  },
  {
    id: 7,
    name: { ar: "طقم لاونج وير - بينك", en: "Loungewear Set – Candy Pink" },
    price: 1399,
    oldPrice: 1899,
    image: "/products/IMG_0754.jpg",
    badge: "NEW",
    rating: 4.9,
    reviews: 33,
    colors: ["#f0b0c0", "#c4a0a0"],
    sizes: ["S", "M", "L"],
  },
  {
    id: 8,
    name: { ar: "هيلو كيتي سبلاش - أبيض", en: "Hello Kitty Splash – White" },
    price: 699,
    oldPrice: 899,
    image: "/products/IMG_0756.jpg",
    badge: null,
    rating: 4.5,
    reviews: 28,
    colors: ["#f0f0f0", "#4a7ab5"],
    sizes: ["M", "L", "XL", "XXL"],
  },
];

function ProductCard({
  product,
  locale,
  index,
  addToCartText,
}: {
  product: (typeof PRODUCTS)[0];
  locale: string;
  index: number;
  addToCartText: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const name = locale === "ar" ? product.name.ar : product.name.en;
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;

  const badgeStyles: Record<string, string> = {
    NEW: "bg-[var(--wide-neon)] text-black",
    HOT: "bg-[var(--wide-error)] text-white",
    RAMADAN: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black",
    SALE: "bg-[var(--wide-info)] text-black",
    EXCLUSIVE: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--wide-border)] bg-[var(--wide-card)] transition-all duration-500 hover:border-[var(--wide-neon-dim)] hover:shadow-[0_8px_40px_rgba(57,255,20,0.08)]"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={product.image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Image Overlay - appears on hover */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
        />

        {/* Badge */}
        {product.badge && (
          <motion.span
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.3 }}
            className={`absolute top-3 start-3 z-10 rounded-lg px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest shadow-lg ${badgeStyles[product.badge] || ""}`}
          >
            {product.badge}
          </motion.span>
        )}

        {/* Discount Badge */}
        {discount && (
          <span className="absolute top-3 end-3 z-10 rounded-lg bg-[var(--wide-error)] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg">
            -{discount}%
          </span>
        )}

        {/* Floating Action Buttons */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-4 left-0 right-0 z-10 flex items-center justify-center gap-2 px-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLiked(!isLiked)}
            className={`flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all ${isLiked
              ? "bg-[var(--wide-error)] text-white"
              : "bg-white/10 text-white hover:bg-white/20"
              }`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--wide-neon)] text-xs font-bold uppercase tracking-wider text-black backdrop-blur-md transition-all hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {addToCartText}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20"
          >
            <Eye className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>

      {/* Product Info */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* Rating & Reviews */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${i < Math.floor(product.rating)
                  ? "fill-[var(--wide-warning)] text-[var(--wide-warning)]"
                  : "text-[var(--wide-border)]"
                  }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-[var(--wide-text-muted)]">
            ({product.reviews})
          </span>
        </div>

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--wide-text-primary)] transition-colors group-hover:text-white">
          {name}
        </h3>

        {/* Color Swatches */}
        <div className="flex items-center gap-1.5">
          {product.colors.map((color, i) => (
            <span
              key={i}
              className="h-3.5 w-3.5 rounded-full border border-[var(--wide-border)]"
              style={{ backgroundColor: color }}
            />
          ))}
          <span className="text-[10px] text-[var(--wide-text-muted)]">
            +{product.sizes.length} sizes
          </span>
        </div>

        {/* Price Row */}
        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-[var(--wide-neon)]">
              {product.price}
              <span className="text-xs font-medium text-[var(--wide-text-muted)]"> EGP</span>
            </span>
            {product.oldPrice && (
              <span className="text-xs text-[var(--wide-text-muted)] line-through">
                {product.oldPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FeaturedProducts() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="relative py-24">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-80 w-80 rounded-full bg-[var(--wide-neon)] opacity-[0.02] blur-[100px]" />
        <div className="absolute -right-40 bottom-1/4 h-80 w-80 rounded-full bg-[var(--wide-neon)] opacity-[0.02] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-3 flex items-center gap-2"
          >
            <span className="h-px w-8 bg-[var(--wide-neon)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--wide-neon)]">
              {t("shop.bestSellers")}
            </span>
            <span className="h-px w-8 bg-[var(--wide-neon)]" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black tracking-tight sm:text-5xl"
          >
            {t("shop.newArrivals")}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 max-w-md text-sm text-[var(--wide-text-secondary)]"
          >
            {locale === "ar"
              ? "أحدث القطع اللي هتخلي ستايلك يتكلم"
              : "The latest pieces that let your style do the talking"}
          </motion.p>
        </div>

        {/* Product Grid - 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {PRODUCTS.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
              index={i}
              addToCartText={t("shop.addToCart")}
            />
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(57, 255, 20, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-3 rounded-full border border-[var(--wide-neon)] bg-transparent px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-[var(--wide-neon)] transition-all hover:bg-[var(--wide-neon)] hover:text-black"
          >
            {locale === "ar" ? "شوف الكل" : "View All Products"}
            <TrendingUp className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          {[
            { icon: Truck, label: t("promo.freeDelivery"), sub: locale === "ar" ? "خلال ٢-٣ أيام" : "2-3 days" },
            { icon: Shield, label: "100% Original", sub: locale === "ar" ? "ضمان أصلية" : "Authenticity guaranteed" },
            { icon: Zap, label: locale === "ar" ? "دفع آمن" : "Secure Payment", sub: locale === "ar" ? "فيزا • فودافون كاش" : "Visa • VodaCash" },
            { icon: Star, label: locale === "ar" ? "أعلى تقييم" : "Top Rated", sub: locale === "ar" ? "+٥٠٠ عميل سعيد" : "500+ happy clients" },
          ].map(({ icon: Icon, label, sub }, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -3, borderColor: "var(--wide-neon-dim)" }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-[var(--wide-border)] bg-[var(--wide-surface)] px-4 py-6 text-center transition-all"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--wide-neon-glow)] text-[var(--wide-neon)]">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-[var(--wide-text-primary)]">
                {label}
              </span>
              <span className="text-[10px] text-[var(--wide-text-muted)]">{sub}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
