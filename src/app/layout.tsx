'use client'

// Import styles of packages that you've installed.
// All packages except `@mantine/hooks` require styles imports
import '@mantine/core/styles.css';
import '@mantine/nprogress/styles.css';
import '@mantine/code-highlight/styles.css';
// import '@mantine/form/styles.css';
// import '@mantine/modals/styles.css';
import '@mantine/notifications/styles.css';

import './globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Inter } from 'next/font/google';
import SessionProvider from '@/provider/SessionProvider';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import { MantineProvider, ColorSchemeScript, createTheme } from '@mantine/core';
import DashboardLayout from '@/components/DashboardLayout/DashboardLayout';
import { ModalsProvider } from '@mantine/modals';
import { NavigationProgress } from '@mantine/nprogress';

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

const theme = createTheme({
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
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body className={inter.className}>
        <MantineProvider
          defaultColorScheme="auto"
          theme={theme}
        >
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              <RealtimeWrapper>
                <NavigationProgress />
                <ModalsProvider>
                  <DashboardLayout>
                    {children}
                  </DashboardLayout>
                </ModalsProvider>
              </RealtimeWrapper>
            </SessionProvider>
          </QueryClientProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
