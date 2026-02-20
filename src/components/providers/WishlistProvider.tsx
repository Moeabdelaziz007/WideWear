"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface WishlistContextValue {
    items: Set<string>;
    add: (id: string) => void;
    remove: (id: string) => void;
    toggle: (id: string) => void;
    has: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<Set<string>>(new Set());

    // load from localStorage
    useEffect(() => {
        try {
            const json = localStorage.getItem("wishlist");
            if (json) {
                const arr: string[] = JSON.parse(json);
                setItems(new Set(arr));
            }
        } catch (_e) {
            // ignore
        }
    }, []);

    // persist
    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(Array.from(items)));
    }, [items]);

    const add = (id: string) => setItems((s) => new Set(s).add(id));
    const remove = (id: string) => setItems((s) => {
        const copy = new Set(s);
        copy.delete(id);
        return copy;
    });
    const toggle = (id: string) => {
        setItems((s) => {
            const copy = new Set(s);
            if (copy.has(id)) copy.delete(id);
            else copy.add(id);
            return copy;
        });
    };
    const has = (id: string) => items.has(id);

    return (
        <WishlistContext.Provider value={{ items, add, remove, toggle, has }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
    return ctx;
}
