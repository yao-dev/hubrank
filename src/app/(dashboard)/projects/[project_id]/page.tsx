'use client';;
import { Button, Tabs, TabsProps } from 'antd';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import { useRouter, useSearchParams } from 'next/navigation';
import KeywordsTable from '@/components/KeywordsTable/KeywordsTable';
import BlogPostsTable from '@/components/BlogPostsTable/BlogPostsTable';
import { PlusOutlined } from '@ant-design/icons';
import WritingStyleForm from '@/components/WritingStyleForm/WritingStyleForm';
import WritingStylesTable from '@/components/WritingStylesTable/WritingStylesTable';
import useBlogPosts from '@/hooks/useBlogPosts';
import useDrawers from '@/hooks/useDrawers';
import NewCaptionDrawer from '@/components/NewCaptionDrawer/NewCaptionDrawer';
import NewBlogPostDrawer from '@/components/NewBlogPostDrawer/NewBlogPostDrawer';
import CaptionsTable from '@/components/CaptionsTable/CaptionsTable';
import PageTitle from '@/components/PageTitle/PageTitle';
import { capitalize } from 'lodash';

export default function ProjectDetail({
  params,
}: {
  params: { project_id: number }
}) {
  const projectId = +params.project_id;
  const { data: project, isFetched } = useProjects().getOne(projectId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "blog-posts")
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const drawers = useDrawers()

  useEffect(() => {
    setActiveTab(searchParams.get("tab") ?? "")
  }, [searchParams])

  useEffect(() => {
    if (isFetched) {
      if (!project?.id) {
        router.replace('/projects');
      }
    }
  }, [project, isFetched]);

  if (isFetched && !project) {
    return null;
  }

  const onChange = (key: string) => {
    setActiveTab(key)
    router.push(`/projects/${params.project_id}?tab=${key}`)
  };

  const items: TabsProps['items'] = [
    {
      key: 'blog-posts',
      label: 'Blog posts',
      children: (
        <BlogPostsTable />
      ),
    },
    {
      key: 'social-media',
      label: 'Social media',
      children: (
        <CaptionsTable />
      )
      // children: (
      //   <Flex align='center' justify='center' style={{ marginTop: 96 }}>
      //     <Empty
      //       image="/image-1.png"
      //       imageStyle={{ height: 200 }}
      //       description={(
      //         <Typography.Text style={{ margin: 0, position: "relative", top: 15 }}>
      //           No social media content
      //         </Typography.Text>
      //       )}
      //     />
      //   </Flex>
      // ),
    },
    {
      key: 'keyword-research',
      label: 'Keyword research',
      children: (
        <KeywordsTable />
      ),
    },
    {
      key: 'writing-styles',
      label: 'Writing style',
      children: <WritingStylesTable setModalOpen={setIsWritingStyleModalOpened} />,
    },
  ];

  const pageTitle = useMemo(() => {
    return (items.find(i => i.key === activeTab)?.label ?? "") as string
  }, [activeTab]);

  const getActionButton = ({ onClick, icon, text }: { onClick: () => void; icon?: ReactNode; text: string }) => {
    return (
      <Button
        type="primary"
        onClick={onClick}
        icon={icon}
      >
        {text}
      </Button>
    )
  }

  const getTabBarExtraContent = () => {
    switch (activeTab) {
      case "blog-posts":
        return getActionButton({
          onClick: () => drawers.openBlogPostDrawer({ isOpen: true }),
          icon: <PlusOutlined />,
          text: "Blog post"
        });
      case "social-media":
        return getActionButton({
          onClick: () => drawers.openCaptionDrawer({ isOpen: true }),
          icon: <PlusOutlined />,
          text: "Caption"
        });
      case "writing-styles":
        return getActionButton({
          onClick: () => setIsWritingStyleModalOpened(true),
          icon: <PlusOutlined />,
          text: "Writing style"
        })
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <WritingStyleForm opened={isWritingStyleModalOpened} setModalOpen={setIsWritingStyleModalOpened} />
      <NewBlogPostDrawer
        open={drawers.blogPost.isOpen}
        onClose={() => drawers.openBlogPostDrawer({ isOpen: false })}
      />
      <NewCaptionDrawer
        open={drawers.caption.isOpen}
        onClose={() => drawers.openCaptionDrawer({ isOpen: false })}
      />

      <PageTitle title={capitalize(pageTitle)} />

      <Tabs
        defaultActiveKey="blog-posts"
        activeKey={activeTab}
        onChange={onChange}
        items={items}
        tabBarExtraContent={{
          right: getTabBarExtraContent()
        }}
      />
    </div>
  );
}
