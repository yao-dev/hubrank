'use client';;
import { Layout, Menu, theme, Flex, Image, MenuProps, Drawer, Typography, Badge } from 'antd';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  IconLogout,
  IconDashboard,
  IconArticle,
  IconSeo,
  IconWriting,
  IconSocial,
  IconPigMoney,
  IconCreditCard,
  IconBulb,
  IconCoin,
  IconSettings,
} from '@tabler/icons-react';
import supabase from '@/helpers/supabase';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import InitClarityTracking from '../InitClarityTracking/InitClarityTracking';
import CustomBreadcrumb from '../CustomBreadcrumb/CustomBreadcrumb';
import useProjectId from '@/hooks/useProjectId';
import Script from 'next/script';
import useUser from '@/hooks/useUser';
import PricingModal from '../PricingModal/PricingModal';
import usePricingModal from '@/hooks/usePricingModal';
import { compact } from 'lodash';

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
        target={target}
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
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab')
  const projectId = useProjectId()
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useUser();
  const pricingModal = usePricingModal()

  // const getMenuLink = (projectId, link) => {
  //   const isProjectSelected = typeof projectId === "number" && projectId !== 0;

  // }

  const data: MenuItem[] = useMemo(() => {
    const isProjectSelected = typeof projectId === "number" && projectId !== 0;

    return compact([
      getItem({ key: "dashboard", link: '/dashboard', label: 'Dashboard', icon: <IconDashboard />, onClick: () => setIsMobileMenuOpen(false) }),
      getItem({ key: "blog-posts", link: isProjectSelected ? `/projects/${projectId}?tab=blog-posts` : '/projects?tab=blog-posts', label: 'Blog posts', icon: <IconArticle />, onClick: () => setIsMobileMenuOpen(false) }),
      getItem({ key: "social-media", link: isProjectSelected ? `/projects/${projectId}?tab=social-media` : '/projects?tab=social-media', label: 'Social media', icon: <IconSocial />, onClick: () => setIsMobileMenuOpen(false) }),
      getItem({ key: "keyword-research", link: isProjectSelected ? `/projects/${projectId}?tab=keyword-research` : '/projects?tab=keyword-research', label: 'Keyword research', icon: <IconSeo />, onClick: () => setIsMobileMenuOpen(false) }),
      getItem({ key: "writing-styles", link: isProjectSelected ? `/projects/${projectId}?tab=writing-styles` : '/projects?tab=writing-styles', label: 'Writing styles', icon: <IconWriting />, onClick: () => setIsMobileMenuOpen(false) }),
      projectId > 0 ? getItem({ key: "project-settings", link: `/projects/${projectId}/settings`, label: 'Settings', icon: <IconSettings />, onClick: () => setIsMobileMenuOpen(false) }) : null,
      // getItem({ key: "integrations", link: isProjectSelected ? `/projects/${projectId}/integrations` : '/projects', label: 'Integrations', icon: <IconPlug />, onClick: () => setIsMobileMenuOpen(false) }),
    ])


    // if (typeof projectId === "number" && projectId !== 0) {
    //   return [
    //     getItem({ key: "dashboard", link: '/dashboard', label: 'Dashboard', icon: <IconDashboard />, onClick: () => setIsMobileMenuOpen(false) }),
    //     getItem({ key: "blog-posts", link: isProjectSelected ? `/projects/${projectId}?tab=blog-posts` : '/dashboard', label: 'Blog posts', icon: <IconArticle />, onClick: () => setIsMobileMenuOpen(false) }),
    //     getItem({ key: "social-media", link: isProjectSelected ? `/projects/${projectId}?tab=social-media` : '/dashboard', label: 'Social media', icon: <IconSocial />, onClick: () => setIsMobileMenuOpen(false) }),
    //     getItem({ key: "keyword-research", link: isProjectSelected ? `/projects/${projectId}?tab=keyword-research` : '/dashboard', label: 'Keyword research', icon: <IconSeo />, onClick: () => setIsMobileMenuOpen(false) }),
    //     getItem({ key: "writing-styles", link: isProjectSelected ? `/projects/${projectId}?tab=writing-styles` : '/dashboard', label: 'Writing styles', icon: <IconWriting />, onClick: () => setIsMobileMenuOpen(false) }),
    //     getItem({ key: "integrations", link: isProjectSelected ? `/projects/${projectId}/integrations` : '/dashboard', label: 'Integrations', icon: <IconPlug />, onClick: () => setIsMobileMenuOpen(false) }),
    //     // getItem({ key: "project-settings", link: `/projects/${projectId}/settings`, label: 'Settings', icon: <IconSettings />, onClick: () => setIsMobileMenuOpen(false) }),
    //     // getItem({
    //     //   key: "project", label: 'Project', icon: <IconStack2 />, children: [
    //     //     getItem({ key: "blog-posts", link: `/projects/${projectId}?tab=blog-posts`, label: 'Blog posts', icon: <IconArticle />, onClick: () => setIsMobileMenuOpen(false) }),
    //     //     getItem({ key: "social-media", link: `/projects/${projectId}?tab=social-media`, label: 'Social media', icon: <IconSocial />, onClick: () => setIsMobileMenuOpen(false) }),
    //     //     getItem({ key: "keyword-research", link: `/projects/${projectId}?tab=keyword-research`, label: 'Keyword research', icon: <IconSeo />, onClick: () => setIsMobileMenuOpen(false) }),
    //     //     getItem({ key: "writing-styles", link: `/projects/${projectId}?tab=writing-styles`, label: 'Writing styles', icon: <IconWriting />, onClick: () => setIsMobileMenuOpen(false) }),
    //     //     // getItem({ key: "integration", link: `/projects/${projectId}/integrations`, label: 'Integrations', icon: <IconPlug />, onClick: () => setIsMobileMenuOpen(false) }),
    //     //     getItem({ key: "project-settings", link: `/projects/${projectId}/settings`, label: 'Settings', icon: <IconSettings />, onClick: () => setIsMobileMenuOpen(false) }),
    //     //   ]
    //     // }),
    //     ...commonLinks
    //   ]
    // }

    // return [
    //   dashboardLink,
    //   ...commonLinks
    // ];
  }, [pathname, projectId]);

  const selectedKeys = useMemo(() => {
    if (pathname.startsWith('/dashboard')) {
      return ["dashboard"]
    }
    if (tab === "blog-posts") {
      return ["blog-posts"]
    }
    if (tab === "social-media") {
      return ["social-media"]
    }
    if (tab === "keyword-research") {
      return ["keyword-research"]
    }
    if (tab === "writing-styles") {
      return ["writing-styles"]
    }
    if (pathname.startsWith('/integrations')) {
      return ["integrations"]
    }
    if (!pathname.startsWith('/settings') && pathname.endsWith('/settings')) {
      return ["project-settings"]
    }
    if (pathname.startsWith('/settings')) {
      return ["settings"]
    }
    if (pathname === '/subscriptions') {
      return ["subscriptions"];
    }
  }, [pathname, params, tab])

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
            selectedKeys={selectedKeys}
            items={data}
            style={{ height: '100%' }}
          />
        </div>
        <Flex vertical gap="large" style={{ marginBottom: 12 }}>
          <Flex vertical>
            {/* <Alert
              type="success"
              message={
                <Typography.Text>
                  You have <b>{user?.subscription?.credits ?? 0}</b> credits left.
                </Typography.Text>
              }
              style={{ margin: 0, marginBottom: 8, border: 0, borderRadius: 0, paddingTop: 15, paddingBottom: 15 }}
            /> */}
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={selectedKeys}
              items={[
                {
                  id: "credits",
                  key: "credits",
                  icon: <IconCoin />,
                  label: (
                    <Flex gap="middle" align='center' onClick={() => pricingModal.open(true, {
                      title: "Get more credits"
                    })}>
                      Credits
                      <Badge count={user?.subscription?.credits ?? 0} overflowCount={10000} showZero color="geekblue" style={{ background: "" }} />
                    </Flex>
                  ),
                  // onClick: () => pricingModal.open(trues)
                } as MenuItem,
                getItem({ key: "subscriptions", link: '/subscriptions', label: 'Subscriptions', icon: <IconCreditCard /> }),
                getItem({ key: "feedback", link: '/feedback', label: 'Feature Request', icon: <IconBulb /> }),
                getItem({ key: "affiliate", link: 'https://hubrank.promotekit.com', label: 'Affiliates - Earn 50%', target: "_blank", icon: <IconPigMoney /> }),
              ]}
            />
          </Flex>
          <Menu
            theme="dark"
            mode="inline"
            items={[
              {
                key: 'logout',
                icon: <IconLogout />,
                label: "Logout",
                onClick: () => supabase.auth.signOut()
              }
            ]}
          />

          {user?.email && <Typography.Text style={{ color: "rgba(255, 255, 255, 0.65)", marginLeft: 28, marginBottom: 10 }}>{user.email}</Typography.Text>}
        </Flex>
      </Flex>
    )
  }, [data, selectedKeys, user])

  return (
    <>
      {/* <Featurebase /> */}
      <InitClarityTracking />
      <Script
        strategy="lazyOnload"
        src="https://embed.tawk.to/668ddf99c3fb85929e3d7110/1i2d32sg5"
      />
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

      <PricingModal />

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
              overflow: "auto"
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