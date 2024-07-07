"use client";
import { Typography } from "antd";

type Props = {
  title: string;
  subtitle?: boolean;
}

const PageTitle = ({ title, subtitle }: Props) => {
  return <Typography.Title level={subtitle ? 3 : 2} style={{ fontWeight: 700, margin: 0 }}>{title}</Typography.Title>
}

export default PageTitle