
import HeroSection from "@/components/landing/hero-section";
import CallToAction from "@/components/landing/cta";
import FeaturesSection from "@/components/landing/feature-section";
import WallOfLoveSection from "@/components/landing/testimonial-section";
import FooterSection from "@/components/layout/footer";
import { HeaderServer } from "@/components/layout/header";


export default function Home() {
  return (
    <>
      <HeaderServer />
      <div className=" min-h-screen bg-background  md:border-x mx-10">
        <HeroSection />
        <FeaturesSection />
        <WallOfLoveSection />
        <CallToAction />
        <FooterSection />
      </div>
    </>
  );
}
