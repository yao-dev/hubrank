"use client";
import { useState, useEffect } from 'react';
import { IconCircleCheckFilled } from "@tabler/icons-react";
import GetStarted from "./GetStarted";


function useTypewriter(words: string[], typingSpeed = 100, deletingSpeed = 50, delay = 2000) {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[loopNum % words.length];
      const isFullWordTyped = !isDeleting && charIndex === currentWord.length;
      const isWordDeleted = isDeleting && charIndex === 0;

      setText(currentWord.substring(0, charIndex));

      if (isFullWordTyped) {
        setTimeout(() => setIsDeleting(true), delay);
      } else if (isWordDeleted) {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      } else {
        const newCharIndex = isDeleting ? charIndex - 1 : charIndex + 1;
        setCharIndex(newCharIndex);
      }
    };

    const timer = setTimeout(handleTyping, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, loopNum, words, typingSpeed, deletingSpeed, delay]);

  return text;
}

const personas = [
  "E-commerce owners",
  "Marketers",
  "Agencies",
  "Content creators",
  "Entrepreneurs",
];


const HeroHeader = () => {
  const text = useTypewriter(personas, 125, 100, 1000);

  return (
    <header className="flex flex-col items-center py-2 lg:py-5 px-4 lg:px-40 mx-auto mt-12 lg:mt-8">
      <div className="container flex flex-col justify-center items-center">
        {/* headline */}
        <h1 className="lg:w-2/3 text-5xl lg:text-6xl font-black mb-4 text-center">
          AI Powered Content Marketing
          <div>
            for{` `}
            <span
              id="typewriter"
              className='text-primary-500 relative stroke-current'
            >
              {text}
              <svg className="absolute -bottom-0.5 left-4 w-2/3 max-w-44 max-h-1.5" viewBox="0 0 55 5" xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none">
                <path d="M0.652466 4.00002C15.8925 2.66668 48.0351 0.400018 54.6853 2.00002" stroke-width="2"></path>
              </svg>
            </span>
          </div>
        </h1>

        {/* subheadline */}
        <h2 className="w-4/5 lg:w-2/3 mb-8 text-center text-zinc-600 text-lg lg:text-xl">
          Create blogs, and socials with no SEO expertise in just few clicks.
        </h2>

        {/* get started cta */}
        <GetStarted />

        <div className="flex flex-row gap-3 lg:gap-6 mb-8 lg:mb-16">
          <div className="flex gap-1">
            <IconCircleCheckFilled />
            <p>Boost your ranking</p>
          </div>
          <div className="flex gap-1">
            <IconCircleCheckFilled />
            <p>Get more traffic</p>
          </div>
          <div className="flex gap-1">
            <IconCircleCheckFilled />
            <p>Generate sales</p>
          </div>
        </div>

        {/* demo/screenshot */}
        <div className="p-2 lg:p-3 bg-white rounded-xl border-2 border-slate-200 shadow-lg w-full">
          <img
            src="/screenshot-blog-posts.png"
            className="rounded-lg border-2 border-slate-200 w-full object-cover"
          />
        </div>
      </div>
    </header>
  )
}

export default HeroHeader