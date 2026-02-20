"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useLocale } from "next-intl";
import useFocusTrap from "@/lib/useFocusTrap";

type SearchResult = {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    sale_price: number | null;
    images: string[];
};

// skeleton for loading
function SearchResultSkeleton() {
    return (
        <div className="flex cursor-pointer items-center gap-4 rounded-lg p-3 animate-pulse">
            <div className="h-16 w-16 rounded-md bg-[var(--wide-bg-secondary)]" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-[var(--wide-bg-secondary)]" />
                <div className="h-3 w-1/3 bg-[var(--wide-bg-secondary)]" />
            </div>
        </div>
    );
}

export function OmniSearch() {
    const locale = useLocale();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(-1);
    const modalRef = useFocusTrap(isOpen);

    useEffect(() => {
        setActiveIndex(-1);
    }, [results]);

    // Toggle Modal
    const handleToggle = () => setIsOpen(!isOpen);

    // Close on escape or outside click
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsOpen(false);
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsOpen(true);
            }

            if (isOpen) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((prev) => Math.max(prev - 1, 0));
                } else if (e.key === "Enter" && activeIndex >= 0) {
                    const product = results[activeIndex];
                    if (product) {
                        setIsOpen(false);
                        router.push(`/${locale}/products/${product.id}`);
                    }
                }
            }
        };

        const handleClickOutside = (e: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, results, activeIndex, locale]);

    // Perform Search Query
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300); // 300ms debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <>
            {/* Navbar Button */}
            <button
                onClick={handleToggle}
                className="relative flex items-center justify-center rounded-full p-2 text-[var(--wide-text-secondary)] transition-colors hover:bg-[var(--wide-bg-secondary)] hover:text-[var(--wide-neon)]"
                aria-label="Search products"
                title="Search (Cmd+K)"
                role="button"
            >
                <Search className="h-5 w-5" />
            </button>

            {/* Search Modal Overlay */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 px-4 pt-20 backdrop-blur-sm sm:pt-32"
                >
                    <div
                        ref={modalRef}
                        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] shadow-2xl"
                    >
                        {/* Search Input Area */}
                        <div className="relative flex items-center border-b border-[var(--wide-border)] px-4">
                            <Search className="h-5 w-5 text-[var(--wide-text-muted)]" />
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-transparent px-4 py-5 text-lg text-[var(--wide-text-primary)] placeholder-[var(--wide-text-muted)] outline-none"
                                placeholder={locale === "ar" ? "ابحث عن الملابس، الألوان..." : "Search hoodies, shoes..."}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-[var(--wide-neon)]" />
                            ) : (
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="rounded p-1 text-[var(--wide-text-muted)] hover:bg-[var(--wide-bg-secondary)] hover:text-white"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Search Results Area */}
                        {query.length >= 2 && (
                            <div
                                role="listbox"
                                aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
                                className="max-h-96 overflow-y-auto p-2"
                                // ensure active item is visible when navigating
                                ref={(el) => {
                                    if (el && activeIndex >= 0) {
                                        const activeEl = el.querySelector(`#search-result-${activeIndex}`) as HTMLElement;
                                        if (activeEl) {
                                            activeEl.scrollIntoView({ block: 'nearest' });
                                        }
                                    }
                                }}
                            >
                                {loading ? (
                                    <div className="space-y-2">
                                        {[...Array(4)].map((_, i) => (
                                            <SearchResultSkeleton key={i} />
                                        ))}
                                    </div>
                                ) : results.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-[var(--wide-text-muted)]">
                                        {locale === "ar" ? "لم نتمكن من العثور على ما تبحث عنه." : "Couldn't find what you're looking for."}
                                    </p>
                                ) : (
                                    <div className="flex flex-col gap-1">
                                        {results.map((product, idx) => (
                                            <a
                                                id={`search-result-${idx}`}
                                                key={product.id}
                                                href={`/${locale}/products/${product.id}`}
                                                onClick={() => setIsOpen(false)}
                                                role="option"
                                                aria-selected={activeIndex === idx}
                                                className={`group flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-[var(--wide-bg-secondary)] ${
                                                    activeIndex === idx ? "bg-[var(--wide-bg-secondary)]" : ""
                                                }`}
                                                onMouseEnter={() => setActiveIndex(idx)}
                                            >
                                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-[var(--wide-border)] bg-[var(--wide-bg-primary)]">
                                                    {product.images && product.images[0] && (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={locale === "ar" ? product.name_ar : product.name_en}
                                                            fill
                                                            loading="lazy"
                                                            className="object-cover transition-transform group-hover:scale-105"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-[var(--wide-text-primary)] group-hover:text-[var(--wide-neon)]">
                                                        {locale === "ar" ? product.name_ar : product.name_en}
                                                    </h4>
                                                    <div className="mt-1 flex items-center gap-2">
                                                        {product.sale_price ? (
                                                            <>
                                                                <span className="font-bold text-[var(--wide-text-primary)]">EGP {product.sale_price}</span>
                                                                <span className="text-sm text-[var(--wide-text-muted)] line-through">EGP {product.price}</span>
                                                            </>
                                                        ) : (
                                                            <span className="font-bold text-[var(--wide-text-primary)]">EGP {product.price}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Footer Hints */}
                        <div className="flex items-center justify-between border-t border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] px-4 py-3 text-xs text-[var(--wide-text-muted)] hidden sm:flex">
                            <span>{locale === "ar" ? "اضغط" : "Press"} <kbd className="rounded border border-[var(--wide-border)] bg-[var(--wide-bg-primary)] px-1 font-sans">Esc</kbd> {locale === "ar" ? "للإغلاق" : "to close"}</span>
                            <span>{locale === "ar" ? "بحث فوري بواسطة" : "Instant search via"} <strong>WideWear</strong></span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
