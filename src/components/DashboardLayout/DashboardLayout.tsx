'use client';;
import { Layout, Typography, Menu, Button, theme, Flex, Image } from 'antd';
import Link from 'next/link';
import { useState } from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import ProjectSelect from '@/components/ProjectSelect';
import { IconSettings, IconPlug, IconCreditCard, IconStack2, IconLogout } from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { usePathname, useRouter } from 'next/navigation';
import useResetApp from '@/hooks/useResetApp';

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

const data = [
  { id: "project", link: '/projects', label: 'Projects', icon: IconStack2 },
  { id: "integration", link: '/integrations', label: 'Integrations', icon: IconPlug },
  { id: "billing", link: '/plan-billing', label: 'Plan & Billing', icon: IconCreditCard },
  { id: "setting", link: '/settings', label: 'Settings', icon: IconSettings },
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
  header: { padding: 0, position: 'sticky', top: 0, width: '100%', zIndex: 1, display: "flex" },
  footer: { position: 'sticky', bottom: 0, width: '100%', zIndex: 1 }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter()
  const pathname = usePathname();
  const resetApp = useResetApp();

  // useEffect(() => {
  //   if (pathname === '/') {
  //     router.replace('/projects');
  //   }
  // }, [pathname]);

  const logout = () => {
    supabase.auth.signOut();
    resetApp()
  }

  const topItems = data.map((item) => {
    return {
      key: item.id,
      icon: <item.icon />,
      label: (
        <Link
          prefetch={false}
          // className={cx(styles.link, active === item.label && styles.linkActive)}
          href={item.link}
          key={item.label}
          style={{
            textDecoration: 'none',
            // color: 'black',
          }}
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
      label: (
        <p onClick={logout} style={{ color: '#fff' }}>Logout</p>
      )
    }
  ]

  return (
    <Layout hasSider style={styles.mainLayout}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{ ...styles.sider }}
      >
        <Flex vertical justify='space-between' style={{ height: '100%' }}>
          <div>
            <Flex align='center' style={{ height: 64, padding: 16, marginBottom: 12 }}>
              <Link href="/projects">
                <Image
                  src="/brand-logo-white.png"
                  preview={false}
                />
              </Link>
            </Flex>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['project']}
              items={topItems}
              style={{ height: '100%', padding: "0 6px" }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <Menu
              theme="dark"
              mode="inline"
              items={bottomItems}
            />
          </div>
        </Flex>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header style={{ ...styles.header, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <ProjectSelect />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
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
  )
}