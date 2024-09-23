import { LOGIN_URL } from "@/helpers/url";
import { Button } from "antd";
import { ReactNode } from "react";

const GetStarted = ({ className, title }: { className?: string; title: ReactNode }) => {
  return (
    <Button size="large" href={LOGIN_URL} className={`bg-primary-500 text-white border-primary-500 mb-8 hover:scale-105 ${className}`}>
      {/* Try for FREE */}
      {/* Try for FREE (5 credits) */}
      {title}
    </Button>
  )
}

export default GetStarted