'use client';;
import { Button, Flex, Grid } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import useProjectId from '@/hooks/useProjectId';
import { SettingOutlined } from "@ant-design/icons";
import ProjectSelect from '../ProjectSelect';
import { ArrowLeftOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

const CustomBreadcrumb = ({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) => {
  const pathname = usePathname();
  const projectId = useProjectId();
  // const { data: project } = useProjects().getOne(projectId);
  // const articleId = useArticleId()
  // const { data: article } = useBlogPosts().getOne(articleId);
  const router = useRouter();
  const screens = useBreakpoint();

  const withSettingsButton = (component: any) => {
    if (!projectId) {
      return component
    }
    return (
      <Flex align="center" justify='space-between' style={{ width: "100%" }}>
        {component}
        {screens.xs ? (
          <Button icon={<SettingOutlined />} onClick={() => router.push(`/projects/${projectId}/settings`)} />
        ) : (
          <Button icon={<SettingOutlined />} onClick={() => router.push(`/projects/${projectId}/settings`)}>Settings</Button>
        )}
      </Flex>
    )
  }

  // if (pathname === "/" || pathname === "/projects") return null;

  // if (!pathname.startsWith('/projects/')) return null;

  return (
    <Flex style={{ marginLeft: 16, marginRight: 16, marginTop: 12 }}>
      {withSettingsButton(
        <Flex gap="small" align="center">
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
      )}
    </Flex>
  )

}

export default CustomBreadcrumb