import { IconCircleCheckFilled } from "@tabler/icons-react";
import GetStarted from "./GetStarted";

const HeroHeader = () => {
  return (
    <header className="flex flex-col items-center py-2 sm:py-5 px-3 sm:px-20 md:px-40 mx-auto mt-16 sm:mt-0">
      <div className="container flex flex-col justify-center items-center">
        {/* headline */}
        <h1 className="w-4/5 sm:w-2/3 text-5xl font-black mb-4 text-center">
          AI Powered Content Marketing
          {/* Get more traffic & sales with AI powered content marketing */}
        </h1>

        {/* subheadline */}
        <h2 className="w-4/5 sm:w-2/3 mb-8 text-center text-zinc-600 text-lg">
          {/* Boost your organic search traffic by x100 in just few clicks. */}
          Create blogs, and socials with no SEO expertise in just few clicks.
        </h2>

        {/* get started cta */}
        <GetStarted />

        <div className="flex flex-col gap-3 sm:gap-6 sm:flex-row mb-8 sm:mb-16">
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
        <div className="p-3 bg-white rounded-xl border-2 border-slate-200 shadow-lg w-full">
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