import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";
import { type NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 1. Refresh Supabase auth session cookies
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
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
