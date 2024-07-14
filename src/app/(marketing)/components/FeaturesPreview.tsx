'use client';
import { Segmented } from "antd";
import { useState } from "react";

const featuresInAction = [
  {
    id: 1,
    title: "Keyword research",
    description: "Keyword research is key to write articles optimised for search intent, with Hubrank you get just that!",
    video: "https://framerusercontent.com/assets/fOFbW6mN9ehCC1qNGeuCNXBAO8.mp4"
  },
  {
    id: 2,
    title: "Match your brand voice",
    description: "Upload samples of existing content to have Hubrank mimic your tone and style. The AI will ensure articles sound as if your marketing team wrote them.",
    video: "https://framerusercontent.com/assets/Te6X1Vcg0W2wNLUL4lNUPgtKB8.mp4"
  },
  {
    id: 3,
    title: "Programmatic SEO",
    video: "https://framerusercontent.com/assets/ND9OZBAsZshGLUqVDD119efGSw.mp4"
  },
]

const FeaturesPreview = () => {
  const [featureInActionVideo, setFeatureInActionVideo] = useState(featuresInAction[0])
  return (
    <section className="container mx-auto px-40 flex flex-col items-center gap-12">
      <div className="flex flex-col items-center gap-6">
        <h3 className="text-2xl font-semibold">See by yourself</h3>
        <Segmented
          size="large"
          options={featuresInAction.map((item) => ({
            label: item.title,
            value: item.id,
          }))}
          style={{ width: "fit-content" }}
          onChange={(id) => setFeatureInActionVideo(featuresInAction.find(item => item.id === id))}
        />
        <p className="text-zinc-600 font-light text-center w-2/3">
          {featureInActionVideo.description}
        </p>
      </div>

      {featureInActionVideo && (
        <div className="p-3 bg-white rounded-xl border-2 border-slate-200 shadow-lg w-4/5 h-[600px]">
          <video
            src={featureInActionVideo.video}
            loop
            autoPlay
            className="rounded-lg border-2 border-slate-200 w-full h-full object-cover"
          />
        </div>
      )}
    </section>
  )
}

export default FeaturesPreview