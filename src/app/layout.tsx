'use client';
// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
// import '@mantine/form/styles.css';
// import '@mantine/modals/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import SessionProvider from '@/provider/SessionProvider';
import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd';
import enUS from 'antd/locale/en_US';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import { App } from 'antd';
import DashboardLayout from '@/components/DashboardLayout/DashboardLayout';

const inter = Inter({ subsets: ['latin'] })
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000 * 60 * 24, // 23h
      cacheTime: 60 * 1000 * 60 * 24, // 24h
      refetchOnReconnect: "always",
      // refetchOnMount: true,
      refetchOnWindowFocus: true,
    },
  },
});

const mantineTheme = createTheme({
  /** Put your mantine theme override here */
  primaryColor: 'dark',
  black: '#000',
  white: '#fff',
  focusRing: 'never',
  // defaultRadius: 'xl'
  cursorType: 'pointer'
});

{/* <Head>
  <title>Page title</title>
  <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
</Head> */}

export default function RootLayout({
  login,
  dashboard,
}: {
  login: React.ReactNode,
  dashboard: React.ReactNode,
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body className={inter.className}>
        <MantineProvider
          defaultColorScheme="light"
          theme={mantineTheme}
        >
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
                  "wireframe": false
                },
                components: {
                  Alert: {
                    colorInfo: "#1677FF",
                    colorInfoBg: "#E6F4FF",
                    colorInfoBorder: "#91CAFF"
                  }
                }
              }}
            >
              <App>
                <QueryClientProvider client={queryClient}>
                  <SessionProvider>
                    {(session) => {
                      return (
                        <RealtimeWrapper>
                          {session ? (
                            <DashboardLayout>
                              {dashboard}
                            </DashboardLayout>
                          ) : login}
                        </RealtimeWrapper>
                      )
                    }}
                  </SessionProvider>
                </QueryClientProvider>
              </App>
            </ConfigProvider>
          </AntdRegistry>
        </MantineProvider>
      </body>
    </html>
  )
}
