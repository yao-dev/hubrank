'use client';;
import Chip from "@/components/Chip/Chip";
import { useState } from "react";

const featuresInAction = [
  {
    id: 0,
    title: "Write blogs",
    demo: "https://demo.arcade.software/M4RXcihEwkkwxVIHIoBS?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true"
  },
  {
    id: 1,
    title: "Keyword research",
    // description: "Keyword research is key to write articles optimised for search intent, with Hubrank you get just that!",
    demo: "https://demo.arcade.software/wjSykDPRx4mxc6lV8S5W?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
  },
  // {
  //   id: 2,
  //   title: "Match your brand voice",
  //   // description: "Upload samples of existing content to have Hubrank mimic your tone and style. The AI will ensure articles sound as if your marketing team wrote them.",
  //   demo: "https://demo.arcade.software/NgZQUaQ5zn4QMTNitpYl?embed&show_copy_link=true",
  // },
  {
    id: 3,
    title: "Programmatic SEO",
    demo: "https://demo.arcade.software/M2czMUKPTWLHyTzF97vD?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
  },
  {
    id: 4,
    title: "Social media",
    demo: "https://demo.arcade.software/n2X2KjTIVHxF6JTMAmhe?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
  },
  {
    id: 5,
    title: "Knowledge bases",
    demo: "https://demo.arcade.software/iCdSIiMpc8xGZscyecjo?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
  },
  {
    id: 6,
    title: "Schema markup",
    demo: "https://demo.arcade.software/8EcyUfcnmIDGlB7aLvxx?embed&embed_mobile=tab&embed_desktop=inline&show_copy_link=true",
  }
]

const FeaturesPreview = () => {
  const [featureInActionVideo, setFeatureInActionVideo] = useState(featuresInAction[0]);

  return (
    <div className='flex flex-col gap-12 w-full'>
      <div className="flex flex-wrap gap-1 lg:gap-2 justify-center">
        {featuresInAction.map((item) => {
          return (
            <Chip
              key={item.id}
              onClick={() => setFeatureInActionVideo(item)}
              isSelected={featureInActionVideo.id === item.id}
            >
              <p>{item.title}</p>
            </Chip>
          )
        })}
      </div>
      <div
        className='relative h-0 w-full rounded-lg'
        style={{
          position: "relative",
          paddingBottom: "calc(57.46527777777778% + 41px)",
          height: 0,
          width: "100%"
        }}
      >
        <iframe
          src={featureInActionVideo.demo}
          title="Hubrank"
          loading="eager"
          allowFullScreen
          allow="clipboard-write"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            colorScheme: "light"
          }}
          className='rounded-lg'
        />
      </div>
    </div>
  )
}

export default FeaturesPreview