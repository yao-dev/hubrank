import { Inter } from 'next/font/google';
import SessionProvider from '@/provider/SessionProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import { App } from 'antd';
import CrispChat from '@/components/CrispChat/CrispChat';
import ReactQueryProvider from '@/components/ReactQueryProvider/ReactQueryProvider';
import AntdProvider from '@/components/AntdProvider/AntdProvider';
import { Metadata } from 'next';
import "./global.css";

const siteConfig = {
  name: "Hubrank"
}

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  // viewport: 'initial-scale=1, minimum-scale=1, maximum-scale=5, width=device-width, height=device-height, shrink-to-fit=no, viewport-fit=cover',
  robots: {
    follow: true,
    index: true
  },
  verification: {
    google: "Rygtep62kwXT58VICywsuxgr1PaASqdfBPn7r9VNlsc"
  },
}

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode,
}) {
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
          <AntdProvider>
            <App>
              <ReactQueryProvider>
                <SessionProvider>
                  <RealtimeWrapper>
                    {children}
                  </RealtimeWrapper>
                </SessionProvider>
              </ReactQueryProvider>
            </App>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html >
  )
}
