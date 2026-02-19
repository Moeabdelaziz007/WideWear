import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import PromoMarquee from "@/components/sections/PromoMarquee";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CollectionsShowcase from "@/components/sections/CollectionsShowcase";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
    return (
        <>
            <Navbar />
            <main>
                <HeroSection />
                <PromoMarquee />
                <FeaturedProducts />
                <CollectionsShowcase />
            </main>
            <Footer />
        </>
    );
}
