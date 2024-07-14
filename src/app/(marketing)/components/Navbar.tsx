'use client';
import useUser from "@/hooks/useUser";
import { Button } from "antd";
import Link from "next/link";
import { IconMenu2 } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useOnClickOutside } from 'usehooks-ts';
import Logo from "./Logo";

const menu = [
  { href: "#features", link: "Features" },
  { href: "#testimonials", link: "Testimonials" },
  { href: "#faq", link: "Faq" },
  { href: "#pricing", link: "Pricing" },
]

const Navbar = () => {
  const user = useUser();
  const ref = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleClickOutside = () => {
    setIsMenuOpen(false)
  }

  useOnClickOutside(ref, handleClickOutside)

  return (
    <nav className="flex flex-col items-center py-2 sm:py-5 px-3 sm:px-20 md:px-40 relative">
      <div className="container flex flex-row justify-between items-center">
        {/* logo */}
        <Logo />

        {/* menu */}
        <div className="hidden sm:flex flex-row gap-4">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-primary-500"
            >
              {item.link}
            </Link>
          ))}
        </div>

        {/* login button */}
        <Button
          href={user ? "/dashboard" : "/login"}
          className="hidden sm:visible bg-black text-white hover:border-transparent"
        >
          {user ? "Dashboard" : "Login"}
        </Button>

        {/* mobile menu */}
        <IconMenu2 onClick={() => setIsMenuOpen(isMenuOpen ? false : true)} className="sm:hidden cursor-pointer z-20" />
      </div>

      {isMenuOpen && (
        <div ref={ref} className="sm:hidden flex flex-col absolute top-[50px] border w-full bg-white transition z-10">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-primary-300 inline-block text-center px-2 py-3"
              onClick={handleClickOutside}
            >
              {item.link}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar