import Link from "next/link"
import { keywords } from "./constants"

const KeywordList = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
      {keywords.map((keyword) => {
        return (
          <Link className="hover:text-primary-500 text-center transition-transform hover:bg-gray-100 p-2 rounded-lg" href={`/glossary/${keyword.slug}`}>{keyword.keyword}</Link>
        )
      })}
    </div>
  )
}

export default KeywordList