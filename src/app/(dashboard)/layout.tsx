"use client";;
import DashboardLayout from "@/components/DashboardLayout/DashboardLayout";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )

}