"use client";

import Link from "next/link";

type Props = {
  name: string;
}

const LetterLink = ({ name }: Props) => {
  return (
    <Link
      href={`/glossary?letter=${name.toLowerCase()}`}
      className="text-primary-500 font-medium underline hover:scale-125 transition-all"
    >
      {name}
    </Link>
  )
}

export default LetterLink