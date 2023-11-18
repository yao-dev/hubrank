'use client';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import DashboardWrapper from '@/components/DashboardLayout/DashboardLayout';
import { ModalsProvider } from '@mantine/modals';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <RealtimeWrapper>
      <ModalsProvider>
        <DashboardWrapper>
          {children}
        </DashboardWrapper>
      </ModalsProvider>
    </RealtimeWrapper>
  )
}
