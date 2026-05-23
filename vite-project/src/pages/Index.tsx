import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CurriculumSection from "@/components/CurriculumSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CurriculumSection />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
};

export default Index;