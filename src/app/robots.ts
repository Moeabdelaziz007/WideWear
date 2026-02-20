import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://widewear.vercel.app";

    return {
        rules: {
            userAgent: "*",
            allow: ["/ar/", "/en/"],
            disallow: ["/api/", "/ar/admin/", "/en/admin/", "/ar/profile/", "/en/profile/"],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
