import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WIDE Wear | وايد وير — Premium Streetwear & Modest Fashion 🇪🇬",
  description:
    "WideWear - Cairo's premium Turkish fashion brand since 1975. Oversized streetwear, modest fashion & Ramadan collections. Buy 2 Get 1 FREE + Free Delivery across Cairo. Obour City & Golf City Mall.",
  keywords: [
    "WideWear",
    "وايد وير",
    "ملابس واسعة",
    "هودي اوفرسايز",
    "عبايات رمضان",
    "ملابس القاهرة",
    "ملابس تركي مصر",
    "streetwear Cairo",
    "oversized fashion",
    "modest fashion Egypt",
    "ملابس محجبات",
    "ملابس اوفرسايز",
    "WideWear Obour",
    "WideWear Golf City",
  ],
  openGraph: {
    title: "WIDE Wear | وايد وير — Premium Streetwear & Modest Fashion 🇪🇬",
    description:
      "WideWear® — Zero Friction. Maximum Style. Premium Turkish fashion since 1975. Buy 2 Get 1 FREE 🔥",
    type: "website",
    locale: "ar_EG",
    alternateLocale: "en_US",
    siteName: "WIDE Wear",
  },
  twitter: {
    card: "summary_large_image",
    title: "WIDE Wear | Premium Streetwear & Modest Fashion",
    description: "Cairo's premium Turkish fashion. Oversized fits & Ramadan collections. Buy 2 Get 1 FREE 🔥",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
