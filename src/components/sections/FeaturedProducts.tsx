"use client";

import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Star, TrendingUp, Truck, Shield, Zap, Heart, ShoppingBag, Eye } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useWishlist } from "@/components/providers/WishlistProvider";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/components/providers/CartProvider";
import QuickViewModal from "../shop/QuickViewModal";

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  price: number;
  sale_price: number | null;
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  badge: string | null;
  stock: number;
  rating: number;
  reviews_count: number;
  video_url?: string;
}

function ProductCard({
  product,
  locale,
  index,
  addToCartText,
  onAddToCart,
  onQuickView,
}: {
  product: Product;
  locale: string;
  index: number;
  addToCartText: string;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const { has, toggle } = useWishlist();
  const isLiked = has(product.id);
  const name = locale === "ar" ? product.name_ar : product.name_en;
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : null;
  const displayPrice = product.sale_price ?? product.price;

  const badgeStyles: Record<string, string> = {
    NEW: "bg-[var(--wide-neon)] text-black",
    HOT: "bg-[var(--wide-error)] text-white",
    RAMADAN: "bg-gradient-to-r from-amber-500 to-yellow-400 text-black",
    SALE: "bg-[var(--wide-info)] text-black",
    EXCLUSIVE: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  };

  const handleAddToCart = () => {
    onAddToCart(product);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--wide-border)] bg-[var(--wide-card)] transition-all duration-300 hover:border-[var(--wide-neon)] hover:-translate-y-2 hover:shadow-[8px_8px_0px_var(--wide-neon)]"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--wide-surface)]">
        {/* Main Image */}
        <Image
          src={product.images?.[0] ?? "/products/IMG_0575.jpg"}
          alt={name}
          fill
          loading="lazy"
          className={`object-cover transition-opacity duration-500 ${isHovered && (product.video_url || product.images?.length > 1) ? 'opacity-0' : 'opacity-100 group-hover:scale-105'}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        {/* Video / Secondary Image on Hover */}
        {product.video_url ? (
          <video
            src={product.video_url}
            autoPlay={isHovered}
            muted
            loop
            playsInline
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : product.images && product.images.length > 1 ? (
          <Image
            src={product.images[1]}
            alt={`${name} secondary view`}
            fill
            loading="lazy"
            className={`absolute inset-0 object-cover transition-transform duration-700 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : null}

        {/* Image Overlay */}
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
            onClick={handleWishlist}
            title={locale === "ar" ? "أضف للمفضلة" : "Add to wishlist"}
            aria-label={locale === "ar" ? "أضف/إزالة من المفضلة" : "Add/remove from wishlist"}
            role="button"
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
            onClick={handleAddToCart}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-all ${addedFeedback
              ? "bg-green-500 text-white"
              : "bg-[var(--wide-neon)] text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
              }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {addedFeedback ? "✅" : addToCartText}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              onQuickView(product);
            }}
            title={locale === "ar" ? "عرض سريع" : "Quick view"}
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
            ({product.reviews_count})
          </span>
        </div>

        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--wide-text-primary)] transition-colors group-hover:text-white">
          {name}
        </h3>

        {/* Color Swatches */}
        <div className="flex items-center gap-1.5">
          {product.colors?.map((color, i) => (
            <span
              key={i}
              className="h-3.5 w-3.5 rounded-full border border-[var(--wide-border)]"
              style={{ backgroundColor: color.hex }}
            />
          ))}
          <span className="text-[10px] text-[var(--wide-text-muted)]">
            +{product.sizes?.length ?? 0} {locale === "ar" ? "مقاسات" : "sizes"}
          </span>
        </div>

        {/* Price Row */}
        <div className="mt-auto flex items-end justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-[var(--wide-neon)]">
              {displayPrice}
              <span className="text-xs font-medium text-[var(--wide-text-muted)]"> EGP</span>
            </span>
            {product.sale_price && (
              <span className="text-xs text-[var(--wide-text-muted)] line-through">
                {product.price}
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
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (data) setProducts(data as Product[]);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const defaultSize = product.sizes?.[0] ?? "M";
    const defaultColor = product.colors?.[0]?.hex ?? null;
    addItem(product.id, defaultSize, defaultColor ?? undefined);
  };

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

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-[var(--wide-border)] bg-[var(--wide-card)]">
                <div className="aspect-[3/4] bg-[var(--wide-surface)]" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-20 rounded bg-[var(--wide-surface)]" />
                  <div className="h-4 w-full rounded bg-[var(--wide-surface)]" />
                  <div className="h-5 w-16 rounded bg-[var(--wide-surface)]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={locale}
                index={i}
                addToCartText={t("shop.addToCart")}
                onAddToCart={handleAddToCart}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}

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
            {t("shop.viewAll")}
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

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />
    </section>
  );
}
