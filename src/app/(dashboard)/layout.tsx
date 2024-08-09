import DashboardLayout from "@/components/DashboardLayout/DashboardLayout";
import { Spin } from "antd";
import { ReactNode, Suspense } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<Spin />}>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </Suspense>
  )

}