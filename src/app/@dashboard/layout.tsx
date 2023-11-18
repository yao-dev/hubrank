'use client';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import DashboardLayout from '@/components/DashboardLayout/DashboardLayout';
import { ModalsProvider } from '@mantine/modals';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <RealtimeWrapper>
      <ModalsProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ModalsProvider>
    </RealtimeWrapper>
  )
}
