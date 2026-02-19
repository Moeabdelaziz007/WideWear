"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ─── Types ──────────────────────────────────────────────
export interface CartProduct {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    sale_price: number | null;
    images: string[];
}

export interface CartItem {
    id: string;
    product_id: string;
    size: string;
    color: string | null;
    quantity: number;
    product?: CartProduct;
}

interface CartContextValue {
    items: CartItem[];
    count: number;
    total: number;
    loading: boolean;
    addItem: (productId: string, size: string, color?: string, quantity?: number) => Promise<void>;
    removeItem: (cartItemId: string) => Promise<void>;
    updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    user: User | null;
}

const GUEST_CART_KEY = "widewear_cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────
export function CartProvider({ children }: { children: React.ReactNode }) {
    const supabase = useMemo(() => createClient(), []);
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    // ── Auth listener ──
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );
        return () => subscription.unsubscribe();
    }, [supabase]);

    // ── Fetch cart (DB for logged in, localStorage for guest) ──
    const fetchCart = useCallback(async () => {
        setLoading(true);

        if (user) {
            const { data } = await supabase
                .from("cart_items")
                .select(`
                    id, product_id, size, color, quantity,
                    product:products(id, name_ar, name_en, price, sale_price, images)
                `)
                .eq("user_id", user.id);

            if (data) {
                setItems(
                    data.map((item) => ({
                        ...item,
                        product: Array.isArray(item.product) ? item.product[0] : item.product,
                    })) as CartItem[]
                );
            }
        } else {
            // Guest cart from localStorage
            try {
                const stored = localStorage.getItem(GUEST_CART_KEY);
                if (stored) setItems(JSON.parse(stored));
                else setItems([]);
            } catch {
                setItems([]);
            }
        }

        setLoading(false);
    }, [user, supabase]);

    useEffect(() => {
        // Avoid double-fetch due to strict mode by using a ref guard
        if (!hasFetched.current || user !== undefined) {
            hasFetched.current = true;
            fetchCart();
        }
    }, [fetchCart, user]);

    // ── Sync guest cart to DB on login ──
    useEffect(() => {
        if (!user) return;
        const syncGuestCart = async () => {
            try {
                const stored = localStorage.getItem(GUEST_CART_KEY);
                if (!stored) return;
                const guestItems: CartItem[] = JSON.parse(stored);
                if (guestItems.length === 0) return;

                for (const item of guestItems) {
                    await supabase.from("cart_items").upsert(
                        {
                            user_id: user.id,
                            product_id: item.product_id,
                            size: item.size,
                            color: item.color,
                            quantity: item.quantity,
                        },
                        { onConflict: "user_id,product_id,size,color" }
                    );
                }
                localStorage.removeItem(GUEST_CART_KEY);
                fetchCart();
            } catch {
                // Silent fail
            }
        };
        syncGuestCart();
    }, [user, supabase, fetchCart]);

    // ── Save guest cart to localStorage ──
    const saveGuestCart = (newItems: CartItem[]) => {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(newItems));
    };

    // ── Add item ──
    const addItem = async (productId: string, size: string, color?: string, quantity = 1) => {
        if (user) {
            await supabase.from("cart_items").upsert(
                {
                    user_id: user.id,
                    product_id: productId,
                    size,
                    color: color ?? null,
                    quantity,
                },
                { onConflict: "user_id,product_id,size,color" }
            );
            await fetchCart();
        } else {
            const existing = items.find(
                (i) => i.product_id === productId && i.size === size && i.color === (color ?? null)
            );
            let newItems: CartItem[];
            if (existing) {
                newItems = items.map((i) =>
                    i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
                );
            } else {
                newItems = [
                    ...items,
                    {
                        id: crypto.randomUUID(),
                        product_id: productId,
                        size,
                        color: color ?? null,
                        quantity,
                    },
                ];
            }
            setItems(newItems);
            saveGuestCart(newItems);
        }
    };

    // ── Remove item ──
    const removeItem = async (cartItemId: string) => {
        if (user) {
            await supabase.from("cart_items").delete().eq("id", cartItemId);
            await fetchCart();
        } else {
            const newItems = items.filter((i) => i.id !== cartItemId);
            setItems(newItems);
            saveGuestCart(newItems);
        }
    };

    // ── Update quantity ──
    const updateQuantity = async (cartItemId: string, quantity: number) => {
        if (quantity < 1) return removeItem(cartItemId);

        if (user) {
            await supabase
                .from("cart_items")
                .update({ quantity })
                .eq("id", cartItemId);
            await fetchCart();
        } else {
            const newItems = items.map((i) =>
                i.id === cartItemId ? { ...i, quantity } : i
            );
            setItems(newItems);
            saveGuestCart(newItems);
        }
    };

    // ── Clear cart ──
    const clearCart = async () => {
        if (user) {
            await supabase.from("cart_items").delete().eq("user_id", user.id);
        }
        setItems([]);
        localStorage.removeItem(GUEST_CART_KEY);
    };

    // ── Computed values ──
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => {
        const price = item.product?.sale_price ?? item.product?.price ?? 0;
        return sum + price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider
            value={{ items, count, total, loading, addItem, removeItem, updateQuantity, clearCart, user }}
        >
            {children}
        </CartContext.Provider>
    );
}

// ─── Hook ───────────────────────────────────────────────
export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within CartProvider");
    return context;
}
