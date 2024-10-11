import {
  IconBrandYoutube,
  IconCode,
  IconForms,
  IconJson,
  IconLink,
  IconSearch,
  IconSeo,
  IconSitemap,
  IconSpeakerphone,
  IconUsers,
  IconWorld,
  IconWriting,
} from "@tabler/icons-react";

const features = [
  {
    id: 1,
    icon: <IconSearch className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Keyword research",
    description: "Keyword research is key to write articles optimised for search intent.",
    video: "https://framerusercontent.com/assets/fOFbW6mN9ehCC1qNGeuCNXBAO8.mp4"
  },
  {
    id: 2,
    icon: <IconSpeakerphone className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Match your brand voice",
    description: "Upload samples of existing content to have Hubrank mimic your tone and style.",
    video: "https://framerusercontent.com/assets/Te6X1Vcg0W2wNLUL4lNUPgtKB8.mp4"
  },
  {
    id: 3,
    icon: <IconWorld className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Go global",
    description: "Hubrank lets you easily create content in English, Spanish, Portuguese, French and Italian.",
    video: "https://framerusercontent.com/assets/dedNJANIsYfWwYsbzdVthCNMfI.mp4"
  },
  {
    id: 4,
    icon: <IconForms className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Diverse content formats",
    description: "Produce 10+ content types optimized for different marketing objectives.",
    video: "https://framerusercontent.com/assets/M7HI4NQXKS9UjH1MIeR7zeqi4vY.mp4"
  },
  {
    id: 5,
    icon: <IconWriting className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Writing angles",
    description: "Choose from 15+ writing perspectives to take a stance, offer pros vs cons, present contradictions, and more.",
    video: "https://framerusercontent.com/assets/ND9OZBAsZshGLUqVDD119efGSw.mp4"
  },
  {
    id: 6,
    icon: <IconUsers className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Connect with readers",
    description: <span>Select the perfect tone from 30+ options like <b>upbeat</b>, <b>sympathetic</b>, or <b>critical</b> to boost your engagement.</span>,
    video: "https://framerusercontent.com/assets/4z3vUF3oZjWkJp52MCLZ9DKxwzQ.mp4"
  },
  {
    id: 7,
    icon: <IconSitemap className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Knowledge base",
    description: "Feed the AI with your content (text,files,urls)",
  },
  {
    id: 8,
    icon: <IconJson className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Structured schema markups",
    description: "Improve your chances of ranking higher and being featured in snippets, driving more organic traffic to your site.",
  },
  {
    id: 9,
    icon: <IconSeo className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Programmatic SEO",
    description: "Become an authority in your niche through bulk SEO writing targeting specific keywords."
  },
  {
    id: 10,
    icon: <IconBrandYoutube className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Youtube to content",
    description: "Create blog posts and social media captions based on your YouTube videos."
  },
  {
    id: 11,
    icon: <IconCode className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Embed Youtube videos",
    description: "Automatically embeds relevant videos in your blogs, enriching your content and keeping readers engaged.",
  },
  {
    id: 12,
    icon: <IconLink className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Internal linking",
    description: "Your sitemap is used to interlink your articles together to improve your SEO score."
  },
  // {
  //   id: 13,
  //   icon: <IconLayoutCollage className="text-primary-500 mx-auto lg:mx-0" />,
  //   title: (
  //     <div className="flex flex-col 2xl:flex-row gap-2 text-center lg:text-left">
  //       <p>In-content images</p>
  //       <Tag color="gold" className="mx-auto lg:mx-0 w-min h-fit">coming soon</Tag>
  //     </div>
  //   ),
  //   description: "In aliquet malesuada consectetur in enim eu maecenas suspendisse. Elementum at enim consequa.",
  // },
]

const Features = () => {
  return (
    // <section id="features" className="bg-[#f9f9ff] pt-14 mb-12">
    <section id="features" className="bg-[#f9f9ff] py-14">
      <div className="container flex flex-col mx-auto items-center gap-4 px-4 lg:px-40">
        <span className="uppercase text-base font-light text-primary-500">features</span>

        <div className="flex flex-col gap-4">
          <h3 className="text-3xl font-semibold text-center mb-8">Your content marketing toolkit</h3>
          {/* <p className="text-base font-light text-zinc-600 lg:w-1/2 mx-auto text-center mb-8">
            The body text should clarify your main intention. Why should people care about your product? Use this space to clarify your product offering.
          </p> */}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12 mb-8 text-center lg:text-left px-6">
            {features.map((item) => (
              <div
                key={item.id}
                className={`flex flex-col gap-2 bg-white border rounded-lg p-6`}
              >
                <p className="text-3xl text-center lg:text-left">{item.icon}</p>
                <p className="text-lg font-semibold">{item.title}</p>
                <p className="text-sm font-light text-zinc-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features