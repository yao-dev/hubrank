import Link from "next/link";
import Logo from "./Logo";

const menu = [
  { href: "#features", link: "Features" },
  { href: "#testimonials", link: "Testimonials" },
  { href: "#faq", link: "Faq" },
  { href: "#pricing", link: "Pricing" },
]

const legals = [
  { href: "/terms-of-services", link: "Terms of services" },
  { href: "/privacy-policy", link: "Privacy Policy" },
]

const Footer = () => {
  return (
    <section className="py-10 lg:py-20 border-t mt-20">
      <div className="flex flex-col-reverse md:flex-row gap-16 container mx-auto px-6 lg:px-40 justify-between">
        <div className="flex flex-col gap-6">
          <Logo />

          <p className="text-sx font-light text-zinc-600 w-72">
            Create blogs, and socials with no SEO expertise in just few clicks.
          </p>

          <div className="flex flex-row gap-6">
            <p>©2024</p>
            <Link href="#home">usehubrank.com</Link>
          </div>
        </div>

        <div className="flex gap-12">
          <div className="flex flex-col gap-6">
            <p className="uppercase font-semibold text-xs">links</p>

            <div className="flex flex-col gap-4">
              {menu.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary-500 text-xs font-light"
                  >
                    {item.link}
                  </Link>
                )
              })}
              <Link
                href="https://hubrank.promotekit.com"
                className="hover:text-primary-500 text-xs font-light"
              >
                Affiliates - Earn 50%
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <p className="uppercase font-semibold text-xs">legal</p>

            <div className="flex flex-col gap-4">
              {legals.map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary-500 text-xs font-light"
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