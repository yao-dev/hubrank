'use client';;
import { useEffect, useState } from "react";

const featuresInAction = [
  {
    id: 1,
    title: "Keyword research",
    // description: "Keyword research is key to write articles optimised for search intent, with Hubrank you get just that!",
    video: "/marketing/demo-keyword-research.mp4",
    content: (
      <div
        style={{
          position: "relative",
          paddingBottom: "calc(57.46527777777778% + 41px)",
          height: 0,
          width: "100%"
        }}
      >
        <iframe
          src="https://demo.arcade.software/H8aUVtESQ7BckCqYygyI?embed&show_copy_link=true"
          title="Hubrank"
          loading="lazy"
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
        />
      </div>

    )
  },
  {
    id: 2,
    title: "Match your brand voice",
    // description: "Upload samples of existing content to have Hubrank mimic your tone and style. The AI will ensure articles sound as if your marketing team wrote them.",
    video: "/marketing/demo-writing-style.mp4",
    content: (
      <div
        style={{
          position: "relative",
          paddingBottom: "calc(57.46527777777778% + 41px)",
          height: 0,
          width: "100%"
        }}
      >
        <iframe
          src="https://demo.arcade.software/NgZQUaQ5zn4QMTNitpYl?embed&show_copy_link=true"
          title="Hubrank"
          loading="lazy"
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
        />
      </div>

    )
  },
  {
    id: 3,
    title: "Programmatic SEO",
    video: "/marketing/demo-pseo.mp4",
    content: (
      <div
        style={{
          position: "relative",
          paddingBottom: "calc(57.46527777777778% + 41px)",
          height: 0,
          width: "100%"
        }}
      >
        <iframe
          src="https://demo.arcade.software/M2RkMOP3v1rWqcYXa55o?embed&show_copy_link=true"
          title="Hubrank"
          loading="lazy"
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
        />
      </div>

    )
  },
  {
    id: 4,
    title: "Captions",
    video: "/marketing/demo-caption.mp4",
    content: (
      <div
        style={{
          position: "relative",
          paddingBottom: "calc(57.46527777777778% + 41px)",
          height: 0,
          width: "100%"
        }}
      >
        <iframe
          src="https://demo.arcade.software/GL7XYzrzz400gjNVcBLB?embed&show_copy_link=true"
          title="Hubrank"
          loading="lazy"
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
        />
      </div>
    )
  },
  {
    id: 5,
    title: "Knowledge base",
    video: "/marketing/demo-knowledge-base.mp4",
    content: (
      <div
        style={{
          position: "relative",
          paddingBottom: "calc(57.46527777777778% + 41px)",
          height: 0,
          width: "100%"
        }}
      >
        <iframe
          src="https://demo.arcade.software/g92uiyqfxX5QYiMJeQJR?embed&show_copy_link=true"
          title="Hubrank"
          loading="lazy"
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
        />
      </div>
    )
  },
  {
    id: 6,
    title: "Schema markup",
    content: (
      <div
        style={{
          position: "relative",
          paddingBottom: "calc(57.46527777777778% + 41px)",
          height: 0,
          width: "100%"
        }}
      >
        <iframe
          src="https://demo.arcade.software/zHkHvD469VX0Bv0zAnRc?embed&show_copy_link=true"
          title="Hubrank"
          loading="lazy"
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
        />
      </div>

    )
  }
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

        {/* <p className="text-zinc-600 text-base font-light text-center w-2/3">
          {featureInActionVideo.description}
        </p> */}
      </div>

      {featureInActionVideo && (
        <div className="transition-all lg:p-3 lg:bg-white rounded-lg lg:rounded-xl border-none lg:border-2 border-slate-200 shadow-lg w-full lg:w-4/5">
          {/* <video
            src={featureInActionVideo.video}
            loop
            autoPlay
            // className="rounded-lg border-2 border-slate-200 w-full h-full object-cover"
            className="rounded-lg border-2 border-slate-200 w-full h-full"
          /> */}
          {featureInActionVideo.content}
        </div>
      )}
    </section>
  )
}

export default FeaturesPreview