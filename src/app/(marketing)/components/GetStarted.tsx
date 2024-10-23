"use client";
import { LOGIN_URL } from "@/helpers/url";
import { Button, Typography } from "antd";
import { ReactNode } from "react";

const GetStarted = ({ className, title, subtitle }: { className?: string; title: ReactNode; subtitle?: string }) => {
  return (
    <div className="flex flex-col gap-2 mb-8">
      <Button size="large" href={LOGIN_URL} className={`bg-primary-500 text-white border-primary-500 hover:scale-105 ${className}`}>
        {title}
      </Button>
      {subtitle && <Typography.Text type="secondary" className="text-center text-xs">{subtitle}</Typography.Text>}
    </div>
  )
}

export default GetStarted