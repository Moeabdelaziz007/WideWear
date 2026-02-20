import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const intlMiddleware = createIntlMiddleware(routing);

// Initialize Upstash Redis and Ratelimit (safe fallback if keys are missing in dev)
const ratelimit =
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
        ? new Ratelimit({
            redis: Redis.fromEnv(),
            limiter: Ratelimit.slidingWindow(10, "10 s"),
            analytics: true,
        })
        : null;

export async function middleware(request: NextRequest) {
    const ip = request.ip ?? "127.0.0.1";
    const path = request.nextUrl.pathname;

    // 1. IP Rate Limiting for API and Checkout paths
    if (ratelimit && (path.startsWith("/api/") || path.includes("/checkout"))) {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return new NextResponse(
                JSON.stringify({ error: "Too Many Requests. Please slow down." }),
                { status: 429, headers: { "Content-Type": "application/json" } }
            );
        }
    }

    // Skip next-intl middleware for API routes entirely
    if (path.startsWith("/api/")) {
        // Still need to update session for API routes if they rely on cookies
        return await updateSession(request);
    }

    // 2. Refresh Supabase auth session cookies
    const supabaseResponse = await updateSession(request);

    // 2. Run i18n middleware for locale detection/routing
    const intlResponse = intlMiddleware(request);

    // 3. Copy Supabase cookies to the i18n response
    supabaseResponse.cookies.getAll().forEach((cookie) => {
        intlResponse.cookies.set(cookie.name, cookie.value);
    });

    return intlResponse;
}

export const config = {
    // Match all request paths except for the ones starting with:
    // - _next (Next.js internals)
    // - _vercel (Vercel internals)
    // - static files (contain dot)
    // NOTE: We REMOVED 'api' from the ignore list so the middleware runs on /api/ routes for Rate Limiting!
    matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
