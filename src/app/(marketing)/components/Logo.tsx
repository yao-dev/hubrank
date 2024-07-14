import { Image } from "antd";
import Link from "next/link";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/">
      <Image
        src="/brand-logo-black.png"
        preview={false}
        className={`w-36 ${className}`}
      />
    </Link>
  )
}

export default Logo