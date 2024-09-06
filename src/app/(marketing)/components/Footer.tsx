import Link from "next/link";
import ProductHuntBadge from "@/components/ProductHuntBadge/ProductHuntBadge";
import dynamic from "next/dynamic";
import { Spin } from "antd";
import { siteConfig } from "@/config/site";
import forms from "../tools/[keyword]/forms";
import { slugify } from "@/helpers/text";
import { competitorList } from "@/options";

const Logo = dynamic(() => import('./Logo'), {
  loading: () => <Spin spinning />,
})

const menu = [
  { href: "#features", link: "Features" },
  // { href: "#testimonials", link: "Testimonials" },
  // { href: "#faq", link: "Faq" },
  { href: "#pricing", link: "Pricing" },
  { href: "/glossary", link: "Glossary" },
]

const legals = [
  { href: "/terms-and-conditions", link: "Terms & conditions" },
  { href: "/privacy-policy", link: "Privacy Policy" },
]

const Footer = () => {
  return (
    <section className="py-10 lg:py-20 border-t mt-20 bg-[#fafafa]/50">
      <div className="flex flex-col md:flex-row gap-16 container mx-auto px-6 lg:px-40 justify-between">
        <div className="flex flex-col gap-6">
          <Logo />

          <ProductHuntBadge />

          <p className="w-72">
            {siteConfig.short_description}
          </p>

          <div className="flex flex-row gap-6">
            <p>©2024</p>
            <Link href="#home" className="hover:text-primary-500">usehubrank.com</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12">
          <div className="flex flex-col gap-4">
            <p className="font-semibold">Links</p>

            <div className="flex flex-col gap-2">
              {menu.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary-500"
                  >
                    {item.link}
                  </Link>
                )
              })}
              {/* <Link
                href="https://hubrank.promotekit.com"
                className="hover:text-primary-500"
              >
                Affiliates - Earn 50%
              </Link> */}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold">Legal</p>

            <div className="flex flex-col gap-2">
              {legals.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary-500"
                  >
                    {item.link}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold">Free tools</p>

            <div className="flex flex-col gap-2">
              {forms.map((form) => {
                return (
                  <Link
                    key={form.id}
                    href={`/tools/${slugify(form.id)}`}
                    className="hover:text-primary-500"
                  >
                    {form.title}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p className="font-semibold">Alternatives</p>

            <div className="flex flex-col gap-2">
              {competitorList.map((item) => {
                return (
                  <Link
                    key={item.slug}
                    href={`/alternatives/${item.slug}`}
                    className="hover:text-primary-500"
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Footer