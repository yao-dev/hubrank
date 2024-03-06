'use client';;
import { QueryClient } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import SessionProvider from '@/provider/SessionProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import { App } from 'antd';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';


const inter = Inter({ subsets: ['latin'] })
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 60 * 1000 * 60 * 24, // 23h
      // staleTime: Infinity,
      // gcTime: Infinity,
      gcTime: 60 * 1000 * 60 * 24, // 23h,
      refetchOnReconnect: "always",
      // refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

let persister: any;

if (typeof window !== "undefined") {
  persister = createSyncStoragePersister({
    storage: window.localStorage,
  })
}


export default function RootLayout({
  children
}: {
  children: React.ReactNode,
}) {
  const {
    token,
  } = theme.useToken();
  return (
    <html lang="en">
      <head>
        <title>Hubrank</title>
      </head>
      <body className={inter.className} style={{ margin: 0, background: token.colorBgLayout }}>
        <AntdRegistry>
          <ConfigProvider
            // https://ant.design/docs/react/i18n
            locale={enUS}
            theme={{
              // 1. Use dark algorithm
              // algorithm: theme.darkAlgorithm,
              // algorithm: theme.compactAlgorithm,
              algorithm: theme.defaultAlgorithm,

              // 2. Combine dark algorithm and compact algorithm
              // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
              token: {
                "colorPrimary": "#5D5FEF",
                "colorInfo": "#232323",
                "wireframe": false,
              },
              components: {
                Alert: {
                  colorInfo: "#1677FF",
                  colorInfoBg: "#E6F4FF",
                  colorInfoBorder: "#91CAFF"
                },
                Layout: {
                  siderBg: "#001529"
                }
              }
            }}
          >
            <App>
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
                <ReactQueryDevtools initialIsOpen={false} />
              </PersistQueryClientProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html >
  )
}
