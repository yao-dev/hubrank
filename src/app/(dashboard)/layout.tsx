"use client";

import DashboardLayout from "@/components/DashboardLayout/DashboardLayout";
import useSession from "@/hooks/useSession";
import { Flex, Spin } from "antd";
import { redirect } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const { session } = useSession();

  useEffect(() => {
    if (!session) {
      redirect('/');
    }
  }, [session])

  if (!session) {
    return (
      <div style={{ width: "100%", height: "100vh" }}>
        <Flex style={{ height: "inherit" }} align="center" justify="center">
          <Spin spinning />
        </Flex>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )

}