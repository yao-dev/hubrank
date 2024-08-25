import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Link from 'next/link';
import { slugify } from "@/helpers/text";
import forms from "./[keyword]/forms";

export default function ToolsPage() {
  return (
    <div className="text-base font-light">
      <Navbar />

      <section className="flex flex-col items-center py-2 lg:py-5 px-4 lg:w-[65%] mx-auto mt-12 lg:mt-0">
        <section className="flex w-full flex-col gap-24 mb-32">
          <div className="flex flex-col gap-6 items-center">
            <h1 className="text-5xl text-center font-bold">Our tools</h1>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex flex-row gap-4 flex-wrap justify-center">
              {forms.map((item) => {
                return (
                  <Link
                    key={item.id}
                    href={`/tools/${slugify(item.id)}`}
                    className="cursor-pointer rounded-full py-2 px-4 border-2 transition hover:border-primary-500"
                  >
                    <span className="flex flex-row gap-2 items-center">
                      {item.icon && <span>{<item.icon />}</span>}
                      {item.title}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      </section>

      <Footer />
    </div>
  )
}