import Link from "next/link";
import ProductHuntBadge from "@/components/ProductHuntBadge/ProductHuntBadge";
import dynamic from "next/dynamic";
import { Spin } from "antd";

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
    <section className="py-10 lg:py-20 border-t mt-20">
      <div className="flex flex-col md:flex-row gap-16 container mx-auto px-6 lg:px-40 justify-between">
        <div className="flex flex-col gap-6">
          <Logo />

          <ProductHuntBadge />

          <p className="font-light text-zinc-600 w-72">
            Generate SEO blogs, social media captions & replies in just few clicks.
          </p>

          <div className="flex flex-row gap-6">
            <p>©2024</p>
            <Link href="#home">usehubrank.com</Link>
          </div>
        </div>

        <div className="flex gap-12">
          <div className="flex flex-col gap-4">
            <p className="font-semibold">Links</p>

            <div className="flex flex-col gap-2">
              {menu.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary-500 font-light"
                  >
                    {item.link}
                  </Link>
                )
              })}
              <Link
                href="https://hubrank.promotekit.com"
                className="hover:text-primary-500 font-light"
              >
                Affiliates - Earn 50%
              </Link>
            </div>
          </div>

          {/* <div className="flex flex-col gap-4">
            <p className="font-semibold">Alternatives</p>

            <div className="grid grid-cols-2 gap-2">
              {competitorList.map((item) => {
                return (
                  <Link
                    key={item.slug}
                    href={`/alternatives/${item.slug}`}
                    className="hover:text-primary-500 font-light"
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div> */}

          <div className="flex flex-col gap-4">
            <p className="font-semibold">Legal</p>

            <div className="flex flex-col gap-2">
              {legals.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary-500 font-light"
                  >
                    {item.link}
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