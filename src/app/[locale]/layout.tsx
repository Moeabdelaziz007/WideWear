import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { CartProvider } from "@/components/providers/CartProvider";
import { WishlistProvider } from "@/components/providers/WishlistProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import SpeedDial from "@/components/ui/SpeedDial";
import { Inter, Oswald, Noto_Sans_Arabic } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });
const notoSansArabic = Noto_Sans_Arabic({ subsets: ["arabic"], variable: "--font-noto-arabic" });

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const messages = (await import(`@/i18n/messages/${locale}.json`)).default;
    const dir = locale === "ar" ? "rtl" : "ltr";
    const fontVariables = `${inter.variable} ${oswald.variable} ${notoSansArabic.variable}`;

    return (
        <html lang={locale} dir={dir} className={`dark ${fontVariables}`} suppressHydrationWarning>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </head>
            <body className="antialiased font-sans">
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ThemeProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <SpeedDial />
                                {children}
                            </WishlistProvider>
                        </CartProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html >
    );
}
