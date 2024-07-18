"use client";;
import { IconChevronDown } from "@tabler/icons-react";
import GetStarted from "./GetStarted";
import { useState } from "react";

const faqs = [
  {
    key: 1,
    question: "Should FAQ’s Answer Frequently Asked Questions?",
    answer: "The answer will often times be yes. The reason being is FAQ’s should always answer questions that are frequently asked.",
    className: "mb-4 border rounded-lg bg-white",
  },
  {
    key: 2,
    question: "Should FAQ’s Answer Frequently Asked Questions?",
    answer: "The answer will often times be yes. The reason being is FAQ’s should always answer questions that are frequently asked.",
    className: "mb-4 border rounded-lg bg-white",
  },
]

const Faq = () => {
  const [activeKeys, setActiveKeys] = useState<number[]>([]);

  const header = (
    <div className="flex flex-col gap-2 items-center text-center lg:items-start lg:text-left">
      <span className="uppercase text-base text-primary-500">have questions?</span>
      <div>
        <h3 className="text-3xl font-semibold mb-4 uppercase">faq</h3>
        <p className="text-base font-light text-zinc-600 mb-4 lg:mb-8">
          Ranking high on Google is way harder than it looks, you've written countless articles and got no traffic or got stuck in the ideation phase.
        </p>
      </div>
      <GetStarted className="w-fit" />
    </div>
  )

  return (
    <section id="faq" className="container mx-auto flex flex-col items-center px-4 lg:px-40 py-5 lg:py-20 gap-3 lg:gap-6">
      <div className="lg:hidden">
        {header}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
        <div className="flex flex-col gap-2">
          {faqs.map(item => {
            const isActive = activeKeys.includes(item.key);
            return (
              <div key={item.key} className="flex flex-col gap-2">
                <div
                  onClick={() => {
                    if (isActive) {
                      setActiveKeys(activeKeys.filter(k => k !== item.key))
                    } else {
                      setActiveKeys([...new Set([...activeKeys, item.key])])
                    }
                  }}
                  className="flex justify-between items-center p-3 rounded-md border hover:border-primary-300 transition cursor-pointer"
                >
                  <p className="text-base font-semibold">{item.question}</p>
                  <IconChevronDown className={`transition duration-500 ${isActive ? "rotate-180" : ""}`} />
                </div>

                {isActive && (
                  <p className="p-3 text-base font-light text-zinc-600">
                    {item.answer}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <div className="hidden lg:block">
          {header}
        </div>
      </div>
    </section>
  )
}

export default Faq