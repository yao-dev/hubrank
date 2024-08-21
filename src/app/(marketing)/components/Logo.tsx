import { Image } from "antd";
import Link from "next/link";

const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <Link href="/" className="website-logo">
      <Image
        src="/brand-logo-black.webp"
        preview={false}
        className={`w-32 lg:w-36 ${className}`}
      />
    </Link>
  )
}

export default Logo