import { MetadataRoute } from "next";
// import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://widewear.vercel.app";
    // const supabase = await createClient();

    // Fetch localized static paths
    const staticPaths = ["", "/auth", "/checkout"].flatMap((route) => [
        {
            url: `${siteUrl}/ar${route}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: route === "" ? 1 : 0.8,
        },
        {
            url: `${siteUrl}/en${route}`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: route === "" ? 1 : 0.8,
        },
    ]);

    // In a future update, we will fetch individual product pages for the sitemap once the dynamic /products/[id] route is firmly established.
    // For V1, the products live on the homepage inside the FeaturedProducts grid.

    return [...staticPaths];
}
