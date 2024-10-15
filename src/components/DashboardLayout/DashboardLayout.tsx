'use client';;
import {
  Layout,
  Menu,
  theme,
  Flex,
  Image,
  MenuProps,
  Drawer,
  Typography,
  Spin,
  Button,
  Modal,
  Result,
} from 'antd';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  IconLogout,
  IconDashboard,
  IconSeo,
  IconWriting,
  IconCreditCard,
  IconBulb,
  IconMessage,
  IconTextCaption,
  IconSpeakerphone,
  IconPigMoney,
  IconPlug,
  IconSettings,
} from '@tabler/icons-react';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import CustomBreadcrumb from '../CustomBreadcrumb/CustomBreadcrumb';
import useProjectId from '@/hooks/useProjectId';
import useUser from '@/hooks/useUser';
import PricingModal from '../PricingModal/PricingModal';
import usePricingModal from '@/hooks/usePricingModal';
import { useLogout } from '@/hooks/useLogout';
import supabase from '@/helpers/supabase/client';
import Confetti from 'react-confetti';

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

const isAppSumoRedeemable = async (userId: string) => {
  const appSumoCode = localStorage.getItem("appsumo_code");
  if (!appSumoCode) return false;

  const { data } = await supabase.from("appsumo_code").select().eq("id", appSumoCode).is("user_id", null).maybeSingle().throwOnError();
  if (data) {
    await supabase.from("appsumo_code").update({ user_id: userId, redeem_date: new Date() }).eq("id", appSumoCode).throwOnError();
    return true;
  }

  return false;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  const {
    token: { colorBgContainer, borderRadiusLG, Layout: { siderBg } },
  } = theme.useToken();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const checkoutSuccess = searchParams.get('checkout_success');
  const projectId = useProjectId()
  const [isMobileView, setIsMobileView] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useUser();
  const pricingModal = usePricingModal();
  const logout = useLogout();
  const [isShowAppSumoModal, setIsShowAppSumoModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      isAppSumoRedeemable(user.id)
        .then((isRedeemable) => {
          if (isRedeemable) {
            setIsShowAppSumoModal(true);
          }
          localStorage.removeItem("appsumo_code");
        })
    }
  }, [user]);

  useEffect(() => {
    if (checkoutSuccess) {
      setTimeout(() => {
        router.replace(`${location.origin}${location.pathname}`);
      }, 5000);
    }
  }, [searchParams]);

  const data: MenuItem[] = useMemo(() => {
    const menus = [
      getItem({ key: "dashboard", link: '/', label: 'Dashboard', icon: <IconDashboard />, onClick: () => setIsMobileMenuOpen(false) }),
    ]

    if (!!projectId) {
      menus.push(
        getItem({ key: "project-settings", link: `/projects/${projectId}/settings`, label: 'Project settings', icon: <IconSettings />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "blog-posts", link: `/projects/${projectId}?tab=blog-posts`, label: 'Blog posts', icon: <IconTextCaption />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "social-media", link: `/projects/${projectId}?tab=social-media`, label: 'Social media', icon: <IconMessage />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "keywords-research", link: `/projects/${projectId}?tab=keywords-research`, label: 'Keywords research', icon: <IconSeo />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "writing-styles", link: `/projects/${projectId}?tab=writing-styles`, label: 'Writing styles', icon: <IconWriting />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "knowledge-bases", link: `/projects/${projectId}?tab=knowledge-bases`, label: 'Knowledge bases', icon: <IconBulb />, onClick: () => setIsMobileMenuOpen(false) }),
        getItem({ key: "integrations", link: `/projects/${projectId}/integrations`, label: 'Integrations', icon: <IconPlug />, onClick: () => setIsMobileMenuOpen(false) }),
      )
    }

    return menus
  }, [pathname, projectId]);

  const selectedKeys = useMemo(() => {
    if (pathname === "/" || pathname === "/dashboard") {
      return ["dashboard"]
    }
    if (tab === "blog-posts") {
      return ["blog-posts"]
    }
    if (pathname.includes('/projects/') && pathname.includes('/articles/')) {
      return ["blog-posts"]
    }
    if (tab === "social-media") {
      return ["social-media"]
    }
    if (tab === "keywords-research") {
      return ["keywords-research"]
    }
    if (tab === "writing-styles") {
      return ["writing-styles"]
    }
    if (tab === "knowledge-bases") {
      return ["knowledge-bases"]
    }
    if (pathname.startsWith('/analytics')) {
      return ["analytics"]
    }
    if (!pathname.startsWith('/settings') && pathname.endsWith('/settings')) {
      return ["project-settings"]
    }
    if (pathname.endsWith('/integrations')) {
      return ["integrations"]
    }
    // if (pathname === '/subscriptions') {
    //   return ["subscriptions"];
    // }
  }, [pathname, params, tab])

  const sideMenuContent = useMemo(() => {
    return (
      <Flex vertical justify='space-between' style={{ height: '100%' }}>
        <div>
          <Flex align='center' style={{ padding: 16, paddingLeft: 28 }}>
            <Link href="/" prefetch>
              <Image
                src="/brand-logo-white.webp"
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
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={selectedKeys}
              items={[
                getItem({
                  key: "feedback", link: '', label: 'Feature request', onClick: () => {
                    if (window.$crisp) {
                      $crisp.push(["set", "message:text", ["Feature request: "]]);
                      $crisp.push(['do', 'chat:open']);
                    }
                  }, icon: <IconSpeakerphone />
                }),
                getItem({ key: "affiliate", link: 'https://hubrank.promotekit.com', label: 'Affiliates - Earn 50%', target: "_blank", icon: <IconPigMoney /> }),
                {
                  key: 'logout',
                  icon: <IconLogout />,
                  label: (
                    <span onClick={logout}>Logout</span>
                  ),
                }
              ]}
            />
          </Flex>
          {/* <Menu
            theme="dark"
            mode="inline"
            items={[
              {
                key: 'logout',
                icon: <IconLogout />,
                label: (
                  <span onClick={logout}>Logout</span>
                ),
              }
            ]}
          /> */}

          {user?.email && <Typography.Text style={{ color: "rgba(255, 255, 255, 0.65)", marginLeft: 28 }}>{user.email}</Typography.Text>}

          <div className='px-2'>
            <div className='bg-gray-100 rounded-md p-3 flex flex-col'>
              <div className='flex flex-row justify-between'>
                <p className='font-semibold'>Words</p>
                <p><b>{user?.premium?.words ?? 0}</b></p>
              </div>
              <div className='flex flex-row justify-between'>
                <p className='font-semibold'>Keywords research</p>
                <p><b>{user?.premium?.keywords_research ?? 0}</b></p>
              </div>
              <div className='flex flex-row justify-between'>
                <p className='font-semibold'>AI images</p>
                <p><b>{user?.premium?.ai_images ?? 0}</b></p>
              </div>

              <Button
                size="small"
                type="primary"
                className='mt-4'
                onClick={() => pricingModal.open(true, {
                  title: "Buy more words"
                })}
              >
                Buy More
              </Button>
            </div>
          </div>
        </Flex>
      </Flex>
    )
  }, [data, selectedKeys, user]);

  if (!user) {
    return (
      <div style={{ width: "100%", height: "100vh" }}>
        <Flex style={{ height: "inherit" }} align="center" justify="center">
          <Spin spinning />
        </Flex>
      </div>
    )
  }

  return (
    <>
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

      <Flex vertical gap="middle" align="center" justify="center">
        {(isShowAppSumoModal || checkoutSuccess) && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
          />
        )}

        <Modal
          open={isShowAppSumoModal}
          mask={false}
          centered
          footer={null}
          width="auto"
          closeIcon
          closable
          onCancel={() => setIsShowAppSumoModal(false)}
        >
          <Result
            status="success"
            title="Thank you, Sumoling!"
            subTitle="You have successfuly redeemed your Sumo code."
            extra={[
              <Button type="primary" onClick={() => setIsShowAppSumoModal(false)}>
                Start now
              </Button>
            ]}
          />
        </Modal>
      </Flex>

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