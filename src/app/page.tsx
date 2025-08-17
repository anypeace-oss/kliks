import { HeroSection } from "@/components/landing/hero-section";
import { Footer } from "@/components/layout/footer";
import Header from "@/components/layout/header";


export default function Home() {
  return (
    <>
      <div className=" min-h-screen bg-background ">

        <Header />
        <div className="min-h-screen md:border-x mx-10 ">

          <HeroSection />
        </div>
      </div>
      <Footer />
    </>
  );
}
