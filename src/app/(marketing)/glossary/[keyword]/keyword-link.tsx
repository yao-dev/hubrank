import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";

type Props = {
  name: string;
  slug: string;
  previous?: boolean;
}

const KeywordLink = ({ name, slug, previous }: Props) => {
  if (!name) {
    return null;
  }

  return (
    <Link
      href={`/glossary/${slug}`}
      className="flex flex-row gap-2 text-primary-500 font-medium"
    >
      {previous && (
        <span>
          <IconChevronLeft />
        </span>
      )}
      <span>
        {name}
      </span>
      {!previous && (
        <span>
          <IconChevronRight />
        </span>
      )}
    </Link>
  )
}

export default KeywordLink