"use client";;
import { ReactNode } from "react";
import SessionProvider from '@/provider/SessionProvider';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient } from '@/helpers/reactQuery';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

let persister: any;

if (typeof window !== "undefined") {
  persister = createSyncStoragePersister({
    storage: window.localStorage,
  })
}

type Props = {
  children: ReactNode
}

const ReactQueryProvider = ({ children }: Props) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister
      }}
    >
      <SessionProvider>
        <RealtimeWrapper>
          {children}
        </RealtimeWrapper>
      </SessionProvider>
    </PersistQueryClientProvider>
  )
}

export default ReactQueryProvider