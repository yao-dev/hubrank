import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Link from 'next/link';
import { slugify } from "@/helpers/text";
import forms from "./forms";
import { Metadata } from "next";

// TODO:
// check email with zerobounce
// also use recaptcha for login form and tools

type Props = {
  params: { keyword: string }
}

const getForm = (keyword: string) => {
  const foundForm = forms.find((form) => {
    return form.keywords.find((kw) => {
      return slugify(kw) === slugify(keyword)
    })
  });

  return foundForm
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const form = getForm(params.keyword);

  return {
    title: form?.title ?? undefined,
    description: form?.subtitle ?? undefined,
    keywords: form?.keywords ?? undefined,
  }
}

export default function ToolPage({ params }: Props) {
  const form = getForm(params.keyword);

  return (
    <div className="text-base font-light">
      <Navbar />

      <section className="relative z-10 flex flex-col items-center py-2 lg:py-5 px-4 lg:w-[65%] mx-auto mt-12 lg:mt-0">
        <section className="flex w-full flex-col gap-24 mb-32">
          <div className="flex flex-col gap-6 items-center">
            {form && <div className="text-2xl">{<form.icon className="w-24 h-24" />}</div>}
            <h1 className="text-5xl text-center font-bold">{form ? form.title : "Our tools"}</h1>
            {form && (
              <h2 className="w-4/5 lg:w-2/3 text-center text-zinc-600 text-lg lg:text-xl">
                {form.subtitle}
              </h2>
            )}
          </div>

          {form && (
            <div className="w-full px-4">
              {form.form}
            </div>
          )}

          {form && form.cta}

          <div className="flex flex-col gap-10">
            {form && <h2 className="text-3xl text-center font-bold">Other tools</h2>}
            <div className="flex flex-row gap-4 flex-wrap justify-center">
              {forms.map((item) => {
                return (
                  <Link
                    key={item.id}
                    href={`/tools/${slugify(item.id)}`}
                    className={`cursor-pointer rounded-full py-2 px-4 border-2 transition hover:border-primary-500 ${item.id === form?.id && "bg-primary-500 border-primary-500 text-white"}`}
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

      {form && <span>{<form.icon stroke={1.5} className="hidden lg:flex absolute top-28 -left-64 w-[900px] h-[900px] rotate-12 text-gray-200/35" />}</span>}

      <Footer />
    </div>
  )
}