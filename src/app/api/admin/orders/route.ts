import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET - Fetch all orders (Admin only)
 */
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        // MVP Admin Check: Must be logged in
        // In production, verify user.role === 'admin' via Supabase RPC or Profile table
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: orders, error } = await supabase
            .from("orders")
            .select(`
                *,
                user:profiles(full_name, phone)
            `)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ orders }, { status: 200 });
    } catch (error: any) {
        console.error("[Admin Orders API] GET Error:", error);
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}

/**
 * PATCH - Update order status (Admin only)
 */
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json({ error: "id and status are required" }, { status: 400 });
        }

        const { data: order, error } = await supabase
            .from("orders")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ order }, { status: 200 });
    } catch (error: any) {
        console.error("[Admin Orders API] PATCH Error:", error);
        return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
    }
}
