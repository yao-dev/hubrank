'use client';;
import { Button, Flex, Grid } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import useProjects from '@/hooks/useProjects';
import useProjectId from '@/hooks/useProjectId';
import useBlogPosts from '@/hooks/useBlogPosts';
import useArticleId from '@/hooks/useArticleId';
import { SettingOutlined } from "@ant-design/icons";
import ProjectSelect from '../ProjectSelect';
import { ArrowLeftOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

const CustomBreadcrumb = ({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) => {
  const pathname = usePathname();
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId);
  const articleId = useArticleId()
  const { data: article } = useBlogPosts().getOne(articleId);
  const router = useRouter();
  const screens = useBreakpoint();

  const withSettingsButton = (component: any) => {
    return (
      <Flex gap="middle" align="end" justify='space-between' style={{ paddingRight: 16 }}>
        {component}
        <Button style={{ marginTop: 12 }} icon={<SettingOutlined />} onClick={() => router.push(`/projects/${projectId}/settings`)}>Settings</Button>
      </Flex>
    )
  }

  // if (pathname === "/" || pathname === "/projects") return null;

  // if (!pathname.startsWith('/projects/')) return null;

  return (
    <Flex gap="small" align="center" style={{ marginLeft: 16, marginRight: 16, marginTop: 12 }}>
      {!screens.lg && (
        <MenuUnfoldOutlined onClick={onOpenMobileMenu} style={{ fontSize: 20, padding: 6 }} />
      )}
      {screens.lg && pathname !== "/" && (
        <Button onClick={() => router.back()} icon={<ArrowLeftOutlined />}>Back</Button>
      )}
      {pathname.startsWith("/projects") && (
        <ProjectSelect />
      )}
    </Flex>
  )

}

export default CustomBreadcrumb