import AboutUs from "@/components/main-page/AboutUs";
import Hero from "@/components/main-page/Hero";
import LimitedEdition from "@/components/main-page/LimitedEdition";
import FAQ from "@/components/main-page/FAQ";
import SocialMedia from "@/components/main-page/SocialMedia";
import TopSale from "@/components/main-page/TopSale";
import WhyChooseUs from "@/components/main-page/WhyChooseUs";
import Reviews from "@/components/main-page/Reviews";

export default function Home() {
  return (
    <main className="mt-20">
      <Hero />
      <TopSale />
      <AboutUs />
      <WhyChooseUs />
      <SocialMedia />
      <LimitedEdition />
      <FAQ />
      <Reviews />
    </main>
  );
}
