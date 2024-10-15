import { Inter } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import RealtimeWrapper from '@/components/RealTimeWrapper/RealTimeWrapper';
import { App, Spin } from 'antd';
import ReactQueryProvider from '@/components/ReactQueryProvider/ReactQueryProvider';
import AntdProvider from '@/components/AntdProvider/AntdProvider';
import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import "./global.css";
import InitClarityTracking from '@/components/InitClarityTracking/InitClarityTracking';
import Recaptcha from '@/components/Recaptcha/Recaptcha';
import { Suspense } from 'react';
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - ${siteConfig.short_description}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
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
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en" className='bg-white'>
      <Script async src="https://cdn.promotekit.com/promotekit.js" data-promotekit="4a1e3ed9-f1d4-482a-91ff-a26969556f72" />
      <body
        className={inter.className}
        style={{
          margin: 0,
          // background: token.colorBgLayout
        }}
      >
        <AntdRegistry>
          <AntdProvider>
            <App>
              <ReactQueryProvider>
                <RealtimeWrapper>
                  <Suspense fallback={<Spin spinning />}>
                    <Recaptcha>
                      {children}
                    </Recaptcha>
                  </Suspense>
                </RealtimeWrapper>
              </ReactQueryProvider>
            </App>
          </AntdProvider>
        </AntdRegistry>
        <InitClarityTracking />
      </body>
    </html>
  )
}
