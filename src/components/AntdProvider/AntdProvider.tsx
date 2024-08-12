"use client";
import { ReactNode } from "react";
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import enUS from 'antd/locale/en_US';
import { ConfigProvider, theme } from "antd";

let persister: any;

if (typeof window !== "undefined") {
  persister = createSyncStoragePersister({
    storage: window.localStorage,
  })
}

type Props = {
  children: ReactNode
}

const AntdProvider = ({ children }: Props) => {
  return (
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
      {children}
    </ConfigProvider>
  )
}

export default AntdProvider