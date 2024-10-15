import CrispChat from "@/components/CrispChat/CrispChat";
import DashboardLayout from "@/components/DashboardLayout/DashboardLayout";
import { Spin } from "antd";
import { ReactNode, Suspense } from "react";

export default function Layout(props: { children: ReactNode }) {
  return (
    <Suspense fallback={<Spin />}>
      <CrispChat />
      <DashboardLayout>
        {props.children}
      </DashboardLayout>
    </Suspense>
  )

}