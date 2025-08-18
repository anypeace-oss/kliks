// import { HeroSection } from "@/components/landing/hero-section";
import HeroSection from "@/components/landing/hero-section";
import CallToAction from "@/components/landing/cta";
import FeaturesSection from "@/components/landing/feature-section";
import WallOfLoveSection from "@/components/landing/testimonial-section";
import FooterSection from "@/components/layout/footer";
// import Header from "@/components/layout/header";


export default function Home() {
  return (
    <>
      <div className=" min-h-screen bg-background ">

        {/* <Header /> */}
        <div className="min-h-screen md:border-x mx-10 ">
          <HeroSection />
          <FeaturesSection />
          <WallOfLoveSection />
          <CallToAction />
          <FooterSection />
        </div>
      </div>
    </>
  );
}
