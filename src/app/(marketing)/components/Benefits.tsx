import { Image } from "antd";

const benefits = [
  {
    icon: "✅",
    title: "Introduce Your Point",
    description: "Get a Google-ready article in just in 5min",
  },
  {
    icon: "🤩",
    title: "Introduce Your Point",
    description: "Save months of failed collaboration with writers",
  },
  {
    icon: "🚀",
    title: "Introduce Your Point",
    description: "Increase your organic search traffic by x100",
  },
]

const Benefits = () => {
  return (
    <>
      {/* <Image
        src="/marketing/arrow.png"
        className=" z-10 top-0 left-10 w-24 h-auto rotate-180 transform -scale-x-100"
        preview={false}
      /> */}
      <section className="container flex flex-col items-center gap-2 px-4 lg:px-40 pt-0 pb-20 lg:py-20 mx-auto relative">
        <img
          src="/marketing/arrow.png"
          className="absolute z-10 w-24 -top-10 left-5 lg:-top-10 lg:left-32 lg:w-[200px] h-auto rotate-180 transform -scale-x-100"
        />

        <span className="uppercase text-primary-500 mb-2 lg:mb-8 text-base">Benefits</span>

        <div className="flex flex-row-reverse gap-16 items-center">
          {/* left section */}
          <div className="flex flex-col lg:w-1/2">
            <h3 className="text-3xl font-semibold mb-4 text-center lg:text-left">With Hubrank</h3>
            <p className="text-base font-light text-zinc-600 mb-8 text-center lg:text-left">
              We removes the need to be a writer to write expert-level articles.
            </p>

            <div className="mb-6">
              {benefits.map((item) => (
                <div key={item.title} className="flex flex-col lg:flex-row gap-4 items-center mb-8 last:mb-0">
                  <p className="text-4xl">{item.icon}</p>
                  <div>
                    {/* <p className="text-base font-semibold mb-1 text-center lg:text-left">{item.title}</p> */}
                    <p className="text-base font-light text-center lg:text-left">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right section */}
          <div className="hidden lg:block w-1/2">
            <Image
              src="/marketing/launch-1.png"
              className="rounded-lg"
              preview={false}
            />
          </div>
        </div>
      </section></>
  )
}

export default Benefits;