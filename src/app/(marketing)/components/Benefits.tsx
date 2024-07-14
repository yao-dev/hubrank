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
    <section className="container flex flex-col items-center gap-2 px-3 sm:px-20 md:px-40 pt-0 pb-20 sm:py-20 mx-auto">
      <span className="uppercase text-primary-500 mb-2 sm:mb-8">Benefits</span>

      <div className="flex flex-row gap-16 items-center">
        {/* left section */}
        <div className="flex flex-col sm:w-1/2">
          <h3 className="text-2xl font-semibold mb-4 text-center sm:text-left">With Hubrank</h3>
          <p className="font-light text-zinc-600 mb-8 text-center sm:text-left">
            We removes the need to be a writer to write expert-level articles.
          </p>

          <div className="mb-6">
            {benefits.map((item) => (
              <div key={item.title} className="flex flex-col sm:flex-row gap-4 items-center mb-8 last:mb-0">
                <p className="text-4xl">{item.icon}</p>
                <div>
                  <p className="text-sm font-semibold mb-1 text-center sm:text-left">{item.title}</p>
                  <p className="text-sm font-light text-center sm:text-left">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right section */}
        <div className="hidden sm:visible w-1/2">
          <Image
            src="/happy-launch.png"
            className="rounded-lg"
            preview={false}
          />
        </div>
      </div>
    </section>
  )
}

export default Benefits;