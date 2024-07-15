import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroHeader from "./components/HeroHeader";
import PainPoints from "./components/PainPoints";
import Benefits from "./components/Benefits";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import FeaturesPreview from "./components/FeaturesPreview";
import Faq from "./components/Faq";
import "./style.css";
import HowItWorks from "./components/HowItWorks";
import Pricing from "./components/Pricing";

export default function LandingPage() {
  return (
    <div id="home" className="flex flex-col gap:12 sm:gap-24 min-h-dvh bg-white scroll-smooth">
      <Navbar />

      <HeroHeader />

      <div>
        <PainPoints />
        <Benefits />
      </div>

      <HowItWorks />

      <Features />

      <FeaturesPreview />

      <Testimonials />

      <div className="mb-12">
        <Pricing />
      </div>

      <Faq />

      <Footer />
    </div>
  );
}