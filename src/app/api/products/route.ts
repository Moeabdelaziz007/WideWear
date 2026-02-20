import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Redis } from "@upstash/redis";

// Initialize Upstash Redis safely
const redis =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? Redis.fromEnv()
        : null;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limitStr = searchParams.get("limit") || "8";
        const limit = parseInt(limitStr, 10);

        const cacheKey = `cache:products:featured:${limit}`;

        // 1. Try to fetch from Redis Cache
        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    console.log(`[Products API] Cache HIT for key: ${cacheKey}`);
                    return NextResponse.json(cached);
                }
            } catch (err) {
                console.error("[Products API] Redis GET Error:", err);
            }
        }

        // 2. Cache MISS, fetch from Supabase
        console.log(`[Products API] Cache MISS, fetching from Supabase for limit: ${limit}`);
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        // 3. Store the result in Redis Cache for 1 hour
        if (redis && data) {
            try {
                // ex: 3600 seconds = 1 hour TTL
                await redis.set(cacheKey, data, { ex: 3600 });
            } catch (err) {
                console.error("[Products API] Redis SET Error:", err);
            }
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("[Products API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
