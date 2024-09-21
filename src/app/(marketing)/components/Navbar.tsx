'use client';;
import { Button } from "antd";
import Link from "next/link";
import { IconMenu2 } from "@tabler/icons-react";
import { useCallback, useRef, useState } from "react";
import Logo from "./Logo";

const menu = [
  { href: "/#features", link: "Features" },
  // { href: "#testimonials", link: "Testimonials" },
  // { href: "#faq", link: "Faq" },
  { href: "/#pricing", link: "Pricing" },
]

const Navbar = () => {
  const ref = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClickOutside = () => {
    setIsMenuOpen(false)
  }

  const loginButton = useCallback((className?: string, textClassName?: string) => {
    return (
      <Button
        href={`${location.protocol}//app.${location.host}/login`}
        className={`bg-black text-white ${className}`}
      >
        <p className={textClassName}>Login</p>
      </Button>
    )
  }, [])

  return (
    <div className="border-b bg-white sticky top-0 z-20">
      <nav className="navbar flex flex-row gap-16 container mx-auto py-3 px-6 lg:px-40 justify-between">
        {/* logo */}
        <Logo />

        {/* menu */}
        <div className="navbar-links hidden lg:flex flex-row gap-10">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="navbar-link hover:text-primary-500 text-lg font-medium"
            >
              {item.link}
            </Link>
          ))}
        </div>

        {loginButton("hidden lg:block w-[144px] border-primary-500 bg-white hover:border-primary-500 hover:scale-105", "text-primary-500")}

        {/* mobile menu trigger */}
        <IconMenu2 id="menu" onClick={() => setIsMenuOpen(isMenuOpen ? false : true)} className="lg:hidden cursor-pointer z-20" />
      </nav>

      {/* mobile menu */}
      {isMenuOpen && (
        <nav ref={ref} className="navbar-links lg:hidden flex flex-col absolute top-[56px] border w-[96%] bg-white transition z-10 shadow-md rounded-lg overflow-hidden">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="navbar-link hover:bg-primary-500 hover:text-white transition inline-block text-center px-2 py-3 border-b last:border-b-0 uppercase"
              onClick={handleClickOutside}
            >
              {item.link}
            </Link>
          ))}

          {loginButton("m-2 py-2 h-fit bg-primary-500")}
        </nav>
      )}
    </div>
  )
}

export default Navbar