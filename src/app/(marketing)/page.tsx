import dynamic from "next/dynamic";
import { Spin } from "antd";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroHeader from "./components/HeroHeader";
import Features from "./components/Features";
import "./style.css";
import PricingCard from "@/components/PricingCard/PricingCard";
import PageTitle from "@/components/PageTitle/PageTitle";

const Pricing = dynamic(() => import('./components/Pricing'), {
  loading: () => <Spin spinning />,
})

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

      {/* <div className="mb-12">
        <Pricing />
      </div> */}

      <section className="py-10 lg:py-20 border-t">
        <div className="container mx-auto px-6 lg:px-40 flex flex-col gap-16 md:flex-row items-center md:items-start md:justify-center">
          <div className="text-center md:text-left">
            <PageTitle title="Pricing" style={{ margin: "14px 0", marginBottom: 0 }} />
            <PageTitle subtitle title="Ready to outrank your competitors?" style={{ fontSize: 16, fontWeight: 400, color: "grey" }} />
          </div>
          <PricingCard />
        </div>
      </section>

      {/* <Faq /> */}

      <Footer />
    </div>
  );
}