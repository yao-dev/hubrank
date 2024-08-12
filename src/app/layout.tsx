'use client';;
import { Inter } from 'next/font/google';
import SessionProvider from '@/provider/SessionProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import { App } from 'antd';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import "./global.css";
import CrispChat from '@/components/CrispChat/CrispChat';
import { queryClient } from '@/helpers/reactQuery';
import Script from 'next/script';


const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en" className='bg-white'>
      <head>
        <title>Hubrank</title>
      </head>
      <body
        className={inter.className}
        style={{
          margin: 0,
          // background: token.colorBgLayout
        }}
      >
        <CrispChat />
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
                colorPrimary: "#5D5FEF",
                colorInfo: "#232323",
                wireframe: false,
                borderRadius: 4,
              },
              components: {
                Alert: {
                  colorInfo: "#1677FF",
                  colorInfoBg: "#E6F4FF",
                  colorInfoBorder: "#91CAFF",
                  algorithm: true
                },
                Layout: {
                  siderBg: "#001529",
                  algorithm: true
                },
                // Input: {
                //   borderRadius: 4,
                //   algorithm: true
                // },
                // Button: {
                //   borderRadius: 4,
                //   algorithm: true
                // }
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
              </PersistQueryClientProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html >
  )
}
