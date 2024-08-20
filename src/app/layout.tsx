import { Inter } from 'next/font/google';
import SessionProvider from '@/provider/SessionProvider';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import { App } from 'antd';
import CrispChat from '@/components/CrispChat/CrispChat';
import ReactQueryProvider from '@/components/ReactQueryProvider/ReactQueryProvider';
import AntdProvider from '@/components/AntdProvider/AntdProvider';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import "./global.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  // viewport: "width=device-width, initial-scale=1",
  robots: {
    follow: true,
    index: true
  },
  verification: {
    google: "Rygtep62kwXT58VICywsuxgr1PaASqdfBPn7r9VNlsc"
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: siteConfig.og_url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: siteConfig.og_url,
    creator: siteConfig.author,
    site: siteConfig.url,
  },
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
      sizes: "28x28"
    },
    {
      rel: "shortcut icon",
      url: "/favicon.ico",
      sizes: "28x28"
    },
  ]
}

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en" className='bg-white'>
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
