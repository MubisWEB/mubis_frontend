import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import LaunchBanner from "@/components/landing/LaunchBanner";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";
import AccessRequestSection from "@/components/landing/AccessRequestSection";
import BenefitsSection from "@/components/landing/BenefitsSection";
import PressSection from "@/components/landing/PressSection";
import StatsSection from "@/components/landing/StatsSection";


const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <LaunchBanner />
        <HowItWorks />
        <Testimonials />
        <BenefitsSection/>
        <PressSection />
        <StatsSection />
        <AccessRequestSection/>
      </main>
      <Footer />
    </div>
  );
};

export default Index;