import CallToActionBanner from "@/components/CallToActionBanner/CallToActionBanner";
import Footer from "../components/Footer";
import GetStarted from "../components/GetStarted";
import Navbar from "../components/Navbar";
import KeywordList from "./[keyword]/keyword-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Essential terms related to SEO, content marketing, and social media. This glossary offers clear definitions to help you master key digital marketing concepts."
}

export default function Glossary() {
  return (
    <div className="text-base font-light">
      <Navbar />
      <section className="flex flex-col items-center py-2 lg:py-5 px-4 lg:w-[65%] mx-auto my-12 lg:mt-0">
        <section className="flex w-full flex-col gap-16 mb-32">
          <h1 className="text-5xl text-center font-bold">Glossary</h1>
          <KeywordList />
        </section>

        <CallToActionBanner
          title="Keywords research + Hubrank = 🚀"
          imageName="keyword-research"
          CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
        />
      </section>
      <Footer />
    </div>
  )
}