'use client';;
import { Layout, Menu, theme, Flex, Image, MenuProps, Drawer } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  IconCreditCard,
  IconLogout,
  IconBulb,
  IconPigMoney,
  IconPlug,
  IconDashboard,
  IconArticle,
  IconSeo,
  IconWriting,
  IconSettings,
} from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { usePathname } from 'next/navigation';
import InitClarityTracking from '../InitClarityTracking/InitClarityTracking';
import CustomBreadcrumb from '../CustomBreadcrumb/CustomBreadcrumb';
import useProjectId from '@/hooks/useProjectId';

const { Sider, Content } = Layout;

const SIDER_WIDTH = 250;

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
  mobileSider: {
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

type MenuItem = Required<MenuProps>['items'][number];

function getItem({
  key,
  icon,
  children,
  label,
  type,
  link,
  target,
  onClick
}: {
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
  link?: string,
  target?: string,
  onClick?: () => void
}): MenuItem {
  return {
    id: key,
    key,
    icon,
    children,
    type,
    link,
    target,
    // style: { paddingLeft: 12 },
    // theme: "light",
    label: link ? (
      <Link
        prefetch
        href={link}
        key={key}
        style={{ textDecoration: 'none' }}
      >
        {label}
      </Link>
    ) : label,
    onClick
  } as MenuItem;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const {
    token: { colorBgContainer, borderRadiusLG, borderRadiusSM, Layout: { siderBg } },
  } = theme.useToken();
  const pathname = usePathname();
  const projectId = useProjectId()
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const data: MenuItem[] = useMemo(() => {
    if (projectId !== null) {
      return [
        getItem({ key: "dashboard", link: '/dashboard', label: 'Dashboard', icon: <IconDashboard />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "article", link: `/projects/${projectId}/articles`, label: 'Articles', icon: <IconArticle />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "keyword", link: `/projects/${projectId}/keywords`, label: 'Keywords', icon: <IconSeo />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "brand-voice", link: `/projects/${projectId}/brand-voices`, label: 'Brand voices', icon: <IconWriting />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "integration", link: `/projects/${projectId}/integrations`, label: 'Integrations', icon: <IconPlug />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "setting", link: `/projects/${projectId}/settings`, label: 'Settings', icon: <IconSettings />, onClick: () => setIsMobileMenuOpen(false) }),
        // getItem({
        //   key: "project", label: 'Project', icon: <IconStack2 />, children: [
        //     getItem({ key: "article", link: `/projects/${projectId}/articles`, label: 'Articles', icon: <IconArticle /> }),
        //     getItem({ key: "keyword", link: `/projects/${projectId}/keywords`, label: 'Keywords', icon: <IconSeo /> }),
        //     getItem({ key: "brand-voice", link: `/projects/${projectId}/brand-voices`, label: 'Brand voices', icon: <IconWriting /> }),
        //     getItem({ key: "integration", link: `/projects/${projectId}/integrations`, label: 'Integrations', icon: <IconPlug /> }),
        //     getItem({ key: "setting", link: `/projects/${projectId}/settings`, label: 'Settings', icon: <IconSettings /> }),
        //   ]
        // }),
        // getItem({ key: "billing", link: '/plan-billing', label: 'Plan & Billing', icon: <IconCreditCard />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "feedback", link: '/feedback', label: 'Feature Request', icon: <IconBulb />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "affiliate", link: 'https://hubrank.promotekit.com', label: 'Earn commissions', target: "_blank", icon: <IconPigMoney />, onClick: () => setIsMobileMenuOpen(false) }),
      ]
    }

    return [
      getItem({ key: "dashboard", link: '/', label: 'Dashboard', icon: <IconDashboard /> }),
      // getItem({ key: "billing", link: '/plan-billing', label: 'Plan & Billing', icon: <IconCreditCard /> }),
      getItem({ key: "feedback", link: '/feedback', label: 'Feature Request', icon: <IconBulb /> }),
      getItem({ key: "affiliate", link: 'https://hubrank.promotekit.com', label: 'Earn commissions', target: "_blank", icon: <IconPigMoney /> }),
    ]
  }, [pathname, projectId]);

  const bottomItems = [
    {
      key: 'logout',
      icon: <IconLogout />,
      label: "Logout",
    }
  ];

  const selectedKeys = useMemo(() => {
    if (pathname.startsWith('/dashboard')) {
      return ["dashboard"]
    }
    if (pathname.includes('/articles')) {
      return ["article"]
    }
    if (pathname.includes('/keywords')) {
      return ["keyword"]
    }
    if (pathname.includes('/brand-voices')) {
      return ["brand-voice"]
    }
    if (pathname.startsWith('/integrations')) {
      return ["integration"]
    }
    if (pathname.startsWith('/settings')) {
      return ["setting"]
    }
    if (pathname.startsWith('/plan-billing')) {
      return ["billing"]
    }
  }, [pathname])

  const sideMenuContent = useMemo(() => {
    return (
      <Flex vertical justify='space-between' style={{ height: '100%' }}>
        <div>
          <Flex align='center' style={{ padding: 16, paddingLeft: 28 }}>
            <Link href="/" prefetch>
              <Image
                src="/brand-logo-white.png"
                preview={false}
                width={125}
              />
            </Link>
          </Flex>
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['article']}
            // defaultOpenKeys={['project']}
            selectedKeys={selectedKeys}
            items={data}
            style={{ height: '100%' }}
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
    )
  }, [data, selectedKeys])

  return (
    <>
      {/* <Featurebase /> */}
      <InitClarityTracking />
      <Drawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        closeIcon={null}
        placement='left'
        style={{ padding: 0 }}
        styles={{ body: { padding: 0 } }}
        rootStyle={{ padding: 0 }}
        width={SIDER_WIDTH}
      >
        <Sider
          theme='dark'
          // trigger={null}
          collapsible={false}
          // zeroWidthTriggerStyle={{ display: "none", overflow: "hidden" }}
          width={SIDER_WIDTH}
          style={{ ...styles.mobileSider, background: siderBg, width: "100%" }}
        >
          {sideMenuContent}
        </Sider>
      </Drawer>

      <Layout hasSider style={styles.mainLayout}>
        <Sider
          breakpoint='lg'
          collapsedWidth="0"
          onCollapse={(collapsed, type) => {
            setIsMobileView(collapsed)
          }}
          trigger={null}
          collapsible={false}
          zeroWidthTriggerStyle={{ display: "none", overflow: "hidden" }}
          width={isMobileView ? 0 : SIDER_WIDTH}
          style={{ ...styles.sider }}
          hidden={isMobileMenuOpen}
        >
          {sideMenuContent}
        </Sider>
        <Layout hasSider={false} style={{ marginLeft: isMobileView ? 0 : SIDER_WIDTH, padding: 0 }}>
          <CustomBreadcrumb onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

          <Content
            style={{
              margin: 16,
              padding: 16,
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