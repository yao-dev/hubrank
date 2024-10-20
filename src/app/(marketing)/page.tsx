import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroHeader from "./components/HeroHeader";
import Features from "./components/Features";
import "./style.css";
import PricingCard from "@/components/PricingCard/PricingCard";
import PageTitle from "@/components/PageTitle/PageTitle";

export default function LandingPage() {
  return (
    <div id="home" className="flex flex-col gap:12 min-h-dvh bg-white scroll-smooth">
      <Navbar />

      <HeroHeader />

      <div className="container mx-auto my-16 flex flex-col gap-4">
        <div className="flex flex-col">
          <h3 className="text-3xl font-semibold text-center mb-2">Automate</h3>
          <h4 className="text-lg text-center text-gray-400 mb-6">Automate your workflow by auto publishing your blog posts via our integrations.</h4>
        </div>
        <div className="flex flex-row flex-wrap justify-center items-center gap-16">
          <img src="/brands/ghost.png" width={150} />
          <img src="/brands/webhook.png" width={150} />
          <img src="/brands/webflow.png" width={150} />
          <img src="/brands/zapier.png" width={150} />
        </div>
      </div>

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

      <section id="pricing" className="py-10 lg:py-20 border-t">
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