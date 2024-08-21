import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroHeader from "./components/HeroHeader";
import Features from "./components/Features";
import Pricing from "./components/Pricing";
import "./style.css";

export default function LandingPage() {
  return (
    <div id="home" className="flex flex-col gap:12 min-h-dvh bg-white scroll-smooth">
      <Navbar />

      <HeroHeader />

      {/* <div>
        <PainPoints />
        <Benefits />
      </div> */}

      {/* <HowItWorks /> */}

      <div className="mt-16">
        <Features />
      </div>

      {/* <FeaturesPreview /> */}

      {/* <Testimonials /> */}

      <div className="mb-12">
        <Pricing />
      </div>

      {/* <Faq /> */}

      <Footer />
    </div>
  );
}