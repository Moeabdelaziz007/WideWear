import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST - Create a new product (Admin only)
 */
export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();

        const { data: product, error } = await supabase
            .from("products")
            .insert(body)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ product }, { status: 201 });
    } catch (error: any) {
        console.error("[Admin Products API] POST Error:", error);
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}

/**
 * PATCH - Update an existing product (Admin only)
 */
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: "Product id is required" }, { status: 400 });
        }

        const { data: product, error } = await supabase
            .from("products")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ product }, { status: 200 });
    } catch (error: any) {
        console.error("[Admin Products API] PATCH Error:", error);
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
