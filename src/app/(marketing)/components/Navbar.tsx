'use client';
import useUser from "@/hooks/useUser";
import { Button } from "antd";
import Link from "next/link";
import { IconMenu2 } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOnClickOutside } from 'usehooks-ts';
import Logo from "./Logo";

const menu = [
  { href: "#features", link: "Features" },
  // { href: "#testimonials", link: "Testimonials" },
  // { href: "#faq", link: "Faq" },
  { href: "#pricing", link: "Pricing" },
]

const Navbar = () => {
  const user = useUser();
  const ref = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [top, setTop] = useState(true);

  useEffect(() => {
    const scrollHandler = () => {
      window.scrollY > 75 ? setTop(false) : setTop(true)
    };
    window.addEventListener('scroll', scrollHandler);
    return () => window.removeEventListener('scroll', scrollHandler);
  }, [top]);

  const handleClickOutside = () => {
    setIsMenuOpen(false)
  }

  useOnClickOutside(ref, handleClickOutside);

  const loginButton = useCallback((className?: string, text?: boolean) => {
    return (
      <Button
        href={user ? "/dashboard" : "/login"}
        className={`bg-black text-white hover:border-transparent ${className}`}
      >
        {user ? "Dashboard" : "Login"}
      </Button>
    )
  }, [user])

  return (
    <nav className={`sticky top-0 flex flex-col items-center py-4 lg:py-4 px-4 lg:px-40 bg-white z-50 ${!top && `shadow-md`}`}>
      <div className="container flex flex-row justify-between items-center">
        {/* logo */}
        <Logo />

        {/* menu */}
        <div className="hidden lg:flex flex-row gap-4">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-primary-500 text-base font-medium"
            >
              {item.link}
            </Link>
          ))}
        </div>

        {loginButton("hidden lg:block")}

        {/* mobile menu trigger */}
        <IconMenu2 id="menu" onClick={() => {
          console.log("click burger menu")
          setIsMenuOpen(isMenuOpen ? false : true);
        }} className="lg:hidden cursor-pointer z-20" />
      </div>

      {/* mobile menu */}
      {isMenuOpen && (
        <div ref={ref} className="lg:hidden flex flex-col absolute top-[56px] border w-[96%] bg-white transition z-10 shadow-md rounded-lg overflow-hidden">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-primary-500 hover:text-white transition inline-block text-center px-2 py-3 border-b last:border-b-0 uppercase"
              onClick={handleClickOutside}
            >
              {item.link}
            </Link>
          ))}

          {loginButton("m-2 py-2 h-fit bg-primary-500")}
        </div>
      )}
    </nav>
  )
}

export default Navbar