'use client';;
import { useEffect, useState } from "react";

const featuresInAction = [
  {
    id: 1,
    title: "Keyword research",
    // description: "Keyword research is key to write articles optimised for search intent, with Hubrank you get just that!",
    video: "/marketing/demo-keyword-research.mp4"
  },
  {
    id: 2,
    title: "Match your brand voice",
    // description: "Upload samples of existing content to have Hubrank mimic your tone and style. The AI will ensure articles sound as if your marketing team wrote them.",
    video: "/marketing/demo-writing-style.mp4"
  },
  {
    id: 3,
    title: "Programmatic SEO",
    video: "/marketing/demo-pseo.mp4"
  },
  {
    id: 4,
    title: "Captions",
    video: "/marketing/demo-caption.mp4"
  },
  {
    id: 5,
    title: "Knowledge base",
    video: "/marketing/demo-knowledge-base.mp4"
  },
]

const FeaturesPreview = () => {
  const [featureInActionVideo, setFeatureInActionVideo] = useState(featuresInAction[0]);

  useEffect(() => {
    // Select all video elements
    const videos = document.querySelectorAll('video');
    // Set playback speed to 2 for each video element
    videos.forEach((video) => {
      video.playbackRate = 2;
    });
  }, [featureInActionVideo]);

  return (
    <section className="container mx-auto px-4 lg:px-40 flex flex-col items-center gap-6 mb-16">
      <div className="flex flex-col items-center gap-6">
        <h3 className="text-3xl font-semibold">See for yourself</h3>
        <div className="flex flex-wrap gap-1 lg:gap-2 justify-center">
          {featuresInAction.map((item) => {
            return (
              <div
                onClick={() => setFeatureInActionVideo(item)}
                className={`cursor-pointer rounded-full py-2 px-4 border transition hover:border-primary-500 ${featureInActionVideo.id === item.id ? "bg-primary-500 text-white" : ""}`}
              >
                <p>{item.title}</p>
              </div>
            )
          })}
        </div>

        <p className="text-zinc-600 text-base font-light text-center w-2/3">
          {featureInActionVideo.description}
        </p>
      </div>

      {featureInActionVideo && (
        <div className="transition-all p-2 lg:p-3 bg-white rounded-xl border-2 border-slate-200 shadow-lg w-full lg:w-4/5">
          <video
            src={featureInActionVideo.video}
            loop
            autoPlay
            // className="rounded-lg border-2 border-slate-200 w-full h-full object-cover"
            className="rounded-lg border-2 border-slate-200 w-full h-full"
          />
        </div>
      )}
    </section>
  )
}

export default FeaturesPreview