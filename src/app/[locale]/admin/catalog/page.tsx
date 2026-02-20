import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CatalogTable } from "../components/CatalogTable";

export default async function AdminCatalogPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const supabase = await createClient();

    // Verify Auth visually
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect(`/${locale}/auth`);

    // Fetch All Products
    const { data: products, error } = await supabase
        .from("products")
        .select(`id, name_ar, name_en, price, sale_price, stock, images`)
        .order("created_at", { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500">Error loading products: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[var(--wide-text-primary)]">Catalog Management</h1>
                <p className="text-sm text-[var(--wide-text-muted)]">
                    Directly edit product prices and stock levels. Click outside an input field to auto-save changes.
                </p>
            </div>

            <CatalogTable initialProducts={products as any[]} locale={locale} />
        </div>
    );
}
