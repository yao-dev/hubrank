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
  const [activeKey, setActiveKey] = useState<number | null>(faqs[0].key);

  return (
    <section id="faq" className="container mx-auto flex flex-col items-center px-40 py-20 gap-6">
      <div className="grid grid-cols-2 gap-12">
        <div className="flex flex-col gap-2">
          {faqs.map(item => {
            const isActive = item.key === activeKey;
            return (
              <div key={item.key} className="flex flex-col gap-2">
                <div
                  onClick={() => setActiveKey(isActive ? null : item.key)}
                  className="flex justify-between items-center p-3 rounded-md border hover:border-primary-300 transition cursor-pointer"
                >
                  <p className="font-semibold">{item.question}</p>
                  <IconChevronDown className={`transition duration-500 ${isActive ? "rotate-180" : ""}`} />
                </div>

                <p className={`p-3 font-light text-zinc-600 transition-all ease-in-out duration-300 ${isActive ? "opacity-100" : "opacity-0 h-0 p-0"}`}>
                  {item.answer}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-2">
          <span className="uppercase text-primary-500">any questions</span>
          <div>
            <h3 className="text-2xl font-semibold mb-4 uppercase">faq</h3>
            <p className="font-light text-zinc-600 mb-8">
              Ranking high on Google is way harder than it looks, you've written countless articles and got no traffic or got stuck in the ideation phase.
            </p>
          </div>
          <GetStarted className="w-fit" />
        </div>
      </div>
    </section>
  )
}

export default Faq