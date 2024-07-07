"use client";
import { Typography } from "antd";

const DrawerTitle = ({ title }: { title: string }) => {
  return <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>{title}</Typography.Title>
}

export default DrawerTitle