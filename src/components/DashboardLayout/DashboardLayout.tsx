'use client';;
import { Layout, Menu, theme, Flex, Image, Spin } from 'antd';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IconCreditCard, IconStack2, IconLogout, IconBulb, IconPigMoney, IconPlug } from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { usePathname } from 'next/navigation';
import CustomBreadcrumb from '../CustomBreadcrumb/CustomBreadcrumb';
import InitClarityTracking from '../InitClarityTracking/InitClarityTracking';

const { Sider, Content } = Layout;

const data = [
  { id: "project", link: '/projects', label: 'Projects', icon: IconStack2 },
  // { id: "integration", link: '/integrations', label: 'Integrations', icon: IconPlug },
  { id: "billing", link: '/plan-billing', label: 'Plan & Billing', icon: IconCreditCard },
  // { id: "setting", link: '/settings', label: 'Settings', icon: IconSettings },
  { id: "feedback", link: '/feedback', label: 'Feature Request', icon: IconBulb },
  { id: "affiliate", link: 'https://hubrank.promotekit.com', label: 'Earn commissions', target: "_blank", icon: IconPigMoney },
];

const styles: { [key: string]: React.CSSProperties } = {
  mainLayout: { minHeight: "100vh" },
  sider: {
    overflow: 'auto',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  header: { padding: 0, paddingLeft: 16, position: 'sticky', top: 0, width: '100%', zIndex: 1, display: "flex" },
  footer: { position: 'sticky', bottom: 0, width: '100%', zIndex: 1 }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 2500);
  }, []);

  const topItems = data.map((item) => {
    return {
      key: item.id,
      icon: <item.icon />,
      style: { paddingLeft: 12 },
      label: (
        <Link
          {...item}
          prefetch={false}
          href={item.link}
          key={item.label}
          style={{ textDecoration: 'none' }}
        >
          {item.label}
        </Link>
      )
    }
  });

  const bottomItems = [
    {
      key: 'logout',
      icon: <IconLogout />,
      label: "Logout",
    }
  ]

  return (
    <>
      {/* <Featurebase /> */}
      <InitClarityTracking />
      <Layout hasSider style={styles.mainLayout}>
        <Sider
          trigger={null}
          collapsible={false}
          zeroWidthTriggerStyle={{ display: "none", overflow: "hidden" }}
          width={250}
          style={{ ...styles.sider }}
        >
          <Flex vertical justify='space-between' style={{ height: '100%' }}>
            <div>
              <Flex align='center' style={{ height: 58, padding: 16, marginBottom: 12 }}>
                <Link href="/projects">
                  <Image
                    src="/brand-logo-white.png"
                    preview={false}
                    width={150}
                  />
                </Link>
              </Flex>
              <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={['project']}
                selectedKeys={[data.find(i => pathname.startsWith(i.link))?.id]}
                items={topItems}
                style={{ height: '100%', padding: "0 3px" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <Menu
                theme="dark"
                mode="inline"
                items={bottomItems}
                onClick={() => supabase.auth.signOut()}
              />
            </div>
          </Flex>
        </Sider>
        <Layout hasSider={false} style={{ marginLeft: 250 }}>
          {/* {pathname.startsWith("/projects/") && (
            <Header style={{ ...styles.header, background: colorBgContainer }}>
              <ProjectSelect />
            </Header>
          )} */}

          <CustomBreadcrumb />

          <Content
            style={{
              margin: 16,
              padding: '16px 24px',
              // minHeight: "100%",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
          {/* <Footer style={{ ...styles.footer, background: colorBgContainer }}>Test</Footer> */}
        </Layout>
      </Layout>
    </>
  )
}