import { Image } from "antd";

const painPoints = [
  {
    icon: "⏳",
    title: "Introduce Your Point",
    description: "Wasting time and effort writing content that gets no traffic at all (yeah, it hurts)",
  },
  {
    icon: "😩",
    title: "Introduce Your Point",
    description: "Struggling to find what to write next",
  },
  {
    icon: "🧑‍💻",
    title: "Introduce Your Point",
    description: "Looking for a decent writer who doesn’t suck without breaking the bank",
  },
]

const PainPoints = () => {
  return (
    <section className="container flex flex-col items-center gap-2 px-4 lg:px-40 py-20 mx-auto lg:mb-16">
      <span className="uppercase text-primary-500 mb-2 lg:mb-8">Pain points</span>

      <div className="flex flex-row gap-16 items-center">
        {/* left section */}
        <div className="flex flex-col lg:w-1/2">
          <h3 className="text-2xl text-center lg:text-left font-semibold mb-4">Before Hubrank</h3>
          <p className="text-center lg:text-left font-light text-zinc-600 mb-8">
            Ranking high on Google is way harder than it looks, you've written countless articles and got no traffic or got stuck in the ideation phase.
          </p>

          <div className="mb-6">
            {painPoints.map((item) => (
              <div key={item.title} className="flex flex-col lg:flex-row gap-4 items-center mb-8 last:mb-0">
                <p className="text-4xl">{item.icon}</p>
                <div>
                  <p className="text-sm font-semibold mb-1 text-center lg:text-left">{item.title}</p>
                  <p className="text-sm font-light text-center lg:text-left">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right section */}
        <div className="hidden lg:block w-1/2">
          <Image
            src="/confused.png"
            className="rounded-lg"
            preview={false}
          />
        </div>
      </div>
    </section>
  )
}

export default PainPoints