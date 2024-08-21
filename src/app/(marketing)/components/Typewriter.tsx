"use client";;
import { useState, useEffect } from 'react';

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
  "E-commerce",
  "Brand Owners",
  "Marketers",
  "Agencies",
  "Creators",
  // "Entrepreneurs",
];

const Typewriter = () => {
  const text = useTypewriter(personas, 125, 100, 1000);
  return text;
}

export default Typewriter