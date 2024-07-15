import { IconCircleCheckFilled } from "@tabler/icons-react";
import GetStarted from "./GetStarted";

const HeroHeader = () => {
  return (
    <header className="flex flex-col items-center py-2 lg:py-5 px-4 lg:px-40 mx-auto mt-12 lg:mt-8">
      <div className="container flex flex-col justify-center items-center">
        {/* headline */}
        <h1 className="w-4/5 lg:w-2/3 text-5xl lg:text-6xl font-black mb-4 text-center">
          AI Powered Content Marketing
        </h1>

        {/* subheadline */}
        <h2 className="w-4/5 lg:w-2/3 mb-8 text-center text-zinc-600 text-lg lg:text-xl">
          Create blogs, and socials with no SEO expertise in just few clicks.
        </h2>

        {/* get started cta */}
        <GetStarted />

        <div className="flex flex-row gap-3 lg:gap-6 mb-8 lg:mb-16">
          <div className="flex gap-1">
            <IconCircleCheckFilled />
            <p>Boost your ranking</p>
          </div>
          <div className="flex gap-1">
            <IconCircleCheckFilled />
            <p>Get more traffic</p>
          </div>
          <div className="flex gap-1">
            <IconCircleCheckFilled />
            <p>Generate sales</p>
          </div>
        </div>

        {/* demo/screenshot */}
        <div className="p-2 lg:p-3 bg-white rounded-xl border-2 border-slate-200 shadow-lg w-full">
          <img
            src="/screenshot-blog-posts.png"
            className="rounded-lg border-2 border-slate-200 w-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}

export default HeroHeader