"use client";
import { Typography } from "antd";

type Props = {
  title: string;
  subtitle?: boolean;
  style?: { [key: string]: any }
}

const PageTitle = ({ title, subtitle, style = {} }: Props) => {
  return <Typography.Title level={subtitle ? 3 : 2} style={{ fontWeight: 700, margin: 0, ...style }}>{title}</Typography.Title>
}

export default PageTitle