import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] }, { status: 200 });
    }

    try {
        const supabase = await createClient();

        // Perform ilike search on both English and Arabic names
        // Note: Supabase natively supports fast ilike matching. In a massive DB, use FTS (Full Text Search)
        const { data, error } = await supabase
            .from("products")
            .select("id, name_en, name_ar, price, sale_price, images")
            .or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`)
            .limit(5);

        if (error) throw error;

        return NextResponse.json({ results: data || [] }, { status: 200 });
    } catch (error) {
        console.error("[Search API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
