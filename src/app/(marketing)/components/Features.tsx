import { Tag } from "antd";
import {
  IconBrandYoutube,
  IconCode,
  IconForms,
  IconJson,
  IconLayoutCollage,
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
    description: "Keyword research is key to write articles optimised for search intent, with Hubrank you get just that!",
    video: "https://framerusercontent.com/assets/fOFbW6mN9ehCC1qNGeuCNXBAO8.mp4"
  },
  {
    id: 2,
    icon: <IconSpeakerphone className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Match your brand voice",
    description: "Upload samples of existing content to have Hubrank mimic your tone and style. The AI will ensure articles sound as if your marketing team wrote them.",
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
    description: "Produce 10+ content types optimized for different marketing objectives – from blog posts to whitepapers and press releases.",
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
    description: "In aliquet malesuada consectetur in enim eu maecenas suspendisse. Elementum at enim consequa.",
  },
  {
    id: 8,
    icon: <IconJson className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Structured schema markups",
    description: "In aliquet malesuada consectetur in enim eu maecenas suspendisse. Elementum at enim consequa.",
  },
  {
    id: 9,
    icon: <IconSeo className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Programmatic SEO",
    description: "In aliquet malesuada consectetur in enim eu maecenas suspendisse. Elementum at enim consequa.",
  },
  {
    id: 10,
    icon: <IconBrandYoutube className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Youtube to content",
    description: "In aliquet malesuada consectetur in enim eu maecenas suspendisse. Elementum at enim consequa.",
  },
  {
    id: 11,
    icon: <IconCode className="text-primary-500 mx-auto lg:mx-0" />,
    title: "Embed Youtube videos",
    description: "In aliquet malesuada consectetur in enim eu maecenas suspendisse. Elementum at enim consequa.",
  },
  {
    id: 12,
    icon: <IconLink className="text-primary-500 mx-auto lg:mx-0" />,
    title: (
      <div className="flex flex-col 2xl:flex-row gap-2 text-center lg:text-left">
        <p>Internal linking</p>
        <Tag color="gold" className="mx-auto lg:mx-0 w-min h-fit">coming soon</Tag>
      </div>
    ),
    description: "In aliquet malesuada consectetur in enim eu maecenas suspendisse. Elementum at enim consequa.",
  },
  {
    id: 13,
    icon: <IconLayoutCollage className="text-primary-500 mx-auto lg:mx-0" />,
    title: (
      <div className="flex flex-col 2xl:flex-row gap-2 text-center lg:text-left">
        <p>In-content images</p>
        <Tag color="gold" className="mx-auto lg:mx-0 w-min h-fit">coming soon</Tag>
      </div>
    ),
    description: "In aliquet malesuada consectetur in enim eu maecenas suspendisse. Elementum at enim consequa.",
  },
]

const Features = () => {
  return (
    <section id="features" className="bg-[#f9f9ff] pt-14">
      <div className="container flex flex-col mx-auto items-center gap-4 px-4 lg:px-40 mb-12">
        <span className="uppercase text-base font-light text-primary-500">features</span>

        <div className="flex flex-col gap-4">
          <h3 className="text-3xl font-semibold text-center">Your content marketing toolset</h3>
          <p className="text-base font-light text-zinc-600 lg:w-1/2 mx-auto text-center mb-8">
            The body text should clarify your main intention. Why should people care about your product? Use this space to clarify your product offering.
          </p>

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