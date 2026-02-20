"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Edit } from "lucide-react";
import Image from "next/image";

type Product = {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    sale_price: number | null;
    stock: number;
    images: string[];
};

export function CatalogTable({ initialProducts, locale }: { initialProducts: Product[]; locale: string }) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const filteredProducts = products.filter((p) =>
        p.name_en.toLowerCase().includes(search.toLowerCase()) ||
        p.name_ar.includes(search)
    );

    const handleQuickUpdate = async (productId: string, field: "stock" | "price" | "sale_price", value: number | null) => {
        setUpdatingId(productId);
        try {
            const res = await fetch("/api/admin/products", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: productId, [field]: value }),
            });

            if (!res.ok) throw new Error(`Failed to update ${field}`);

            setProducts((prev) =>
                prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p))
            );
            router.refresh();
        } catch (error) {
            console.error("Update error:", error);
            alert(`Failed to update ${field}`);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--wide-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] py-2 pl-9 pr-4 text-sm text-[var(--wide-text-primary)] focus:border-[var(--wide-neon)] focus:outline-none focus:ring-1 focus:ring-[var(--wide-neon)]"
                    />
                </div>
                {/* Future: Add Product Button */}
                <button className="flex items-center justify-center rounded-lg bg-[var(--wide-neon)] px-4 py-2 text-sm font-bold text-black transition-opacity hover:opacity-90">
                    + Add Product
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-[var(--wide-border)] bg-[var(--wide-bg-secondary)] shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-[var(--wide-border)] bg-[var(--wide-bg-primary)] text-[var(--wide-text-muted)]">
                            <tr>
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">Price (EGP)</th>
                                <th className="px-6 py-4 font-medium">Sale Price</th>
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--wide-border)]">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--wide-text-muted)]">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className={`transition-colors hover:bg-[var(--wide-bg-primary)] ${updatingId === product.id ? 'opacity-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {product.images && product.images[0] ? (
                                                    <div className="relative h-12 w-12 overflow-hidden rounded-md border border-[var(--wide-border)] bg-[var(--wide-bg-primary)]">
                                                        <Image src={product.images[0]} alt={product.name_en} fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-md bg-[var(--wide-border)]" />
                                                )}
                                                <div>
                                                    <p className="font-medium text-[var(--wide-text-primary)]">{product.name_en}</p>
                                                    <p className="text-xs text-[var(--wide-text-muted)]">{product.name_ar}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                className="w-20 rounded bg-transparent px-2 py-1 outline-none focus:ring-1 focus:ring-[var(--wide-neon)]"
                                                value={product.price}
                                                onBlur={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val !== product.price) handleQuickUpdate(product.id, "price", val);
                                                }}
                                                onChange={(e) => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: parseFloat(e.target.value) || 0 } : p))}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                placeholder="None"
                                                className="w-20 rounded bg-transparent px-2 py-1 text-[var(--wide-neon)] outline-none focus:ring-1 focus:ring-[var(--wide-neon)]"
                                                value={product.sale_price || ""}
                                                onBlur={(e) => {
                                                    const val = e.target.value ? parseFloat(e.target.value) : null;
                                                    if (val !== product.sale_price) handleQuickUpdate(product.id, "sale_price", val);
                                                }}
                                                onChange={(e) => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, sale_price: parseFloat(e.target.value) || null } : p))}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    className={`w-16 rounded bg-transparent px-2 py-1 outline-none focus:ring-1 ${product.stock <= 5 ? 'text-red-500 font-bold focus:ring-red-500' : 'focus:ring-[var(--wide-neon)]'}`}
                                                    value={product.stock}
                                                    onBlur={(e) => {
                                                        const val = parseInt(e.target.value, 10);
                                                        if (val !== product.stock) handleQuickUpdate(product.id, "stock", val);
                                                    }}
                                                    onChange={(e) => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: parseInt(e.target.value) || 0 } : p))}
                                                />
                                                {product.stock === 0 && <span className="text-[10px] font-bold uppercase text-red-500">Out</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => alert("Full edit modal coming soon")}
                                                className="inline-flex items-center justify-center rounded-md p-2 text-[var(--wide-text-muted)] transition-colors hover:bg-[var(--wide-bg-primary)] hover:text-[var(--wide-neon)]"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
