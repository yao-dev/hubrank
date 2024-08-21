import CallToActionBanner from "@/components/CallToActionBanner/CallToActionBanner";
import Footer from "../components/Footer";
import GetStarted from "../components/GetStarted";
import Navbar from "../components/Navbar";
import KeywordList from "./[keyword]/keyword-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary"
}

export default function Glossary() {
  return (

    <div className="text-base font-light">
      <Navbar />
      <section className="flex flex-col items-center py-2 lg:py-5 px-4 lg:w-[65%] mx-auto mt-12 lg:mt-0">
        <section className="flex w-full flex-col gap-16 mb-32">
          <h1 className="text-5xl text-center font-bold">Glossary</h1>

          {/* <div className='flex flex-row gap-2 mx-auto'>
            {letters.map((letter) => {
              return (
                <LetterLink key={letter} name={letter} />
              )
            })}
          </div> */}

          <KeywordList />
        </section>

        <CallToActionBanner
          title="Keyword research + Hubrank = 🚀"
          imageName="keyword-research"
          CallToAction={<GetStarted title="Try Now" className='mb-0 mx-auto xl:mx-0' />}
        />
      </section>
      <Footer />
    </div>
  )
}