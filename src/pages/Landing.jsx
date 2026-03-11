import TopBar from "@/components/TopBar";
import MainNav from "@/components/MainNav";
import HeroSection from "@/components/HeroSection";
import AlliesSection from "@/components/AlliesSection";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import SponsorBanner from "@/components/SponsorBanner";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <MainNav />
      <SponsorBanner />
      <main className="flex-1">
        <HeroSection />
        <AlliesSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
};

export default Index;