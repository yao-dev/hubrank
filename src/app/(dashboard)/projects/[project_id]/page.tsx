'use client';;
import { Button, Flex, Tabs, TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import { useRouter, useSearchParams } from 'next/navigation';
import KeywordsTable from '@/components/KeywordsTable/KeywordsTable';
import ArticlesTable from '@/components/ArticlesTable/ArticlesTable';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import WritingStyleForm from '@/components/WritingStyleForm/WritingStyleForm';
import WritingStylesTable from '@/components/WritingStylesTable/WritingStylesTable';
import useBlogPosts from '@/hooks/useBlogPosts';

export default function ProjectDetail({
  params,
}: {
  params: { project_id: number }
}) {
  const projectId = +params.project_id;
  const { data: project, isFetched } = useProjects().getOne(projectId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "articles")
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const { getAll } = useBlogPosts()
  const { refetch: refetchArticles, isRefetching } = getAll({ queue: false });

  useEffect(() => {
    if (isFetched) {
      if (!project?.id) {
        router.replace('/projects');
      } else {
        router.replace(`/projects/${project.id}?tab=articles`);
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
      key: 'articles',
      label: 'Articles',
      children: (
        <ArticlesTable />
      ),
    },
    {
      key: 'keyword-ideas',
      label: 'Keyword ideas',
      children: (
        <KeywordsTable />
      ),
    },
    {
      key: 'saved-keywords',
      label: 'Saved keywords',
      children: (
        <KeywordsTable savedMode />
      ),
    },
    {
      key: 'writing-styles',
      label: 'Writing style',
      children: <WritingStylesTable setModalOpen={setIsWritingStyleModalOpened} />,
    },
  ];

  const getTabBarExtraContent = () => {
    switch (activeTab) {
      case "writing-styles":
        return (
          <Button
            type="primary"
            onClick={() => setIsWritingStyleModalOpened(true)}
            icon={<PlusOutlined />}
          >
            Add writing style
          </Button>
        )
      case "articles":
        return (
          <Flex gap="small">
            <Button loading={isRefetching} style={{ width: 120 }} onClick={() => refetchArticles()} icon={<ReloadOutlined />}>Refresh</Button>
            <Button
              type="primary"
              onClick={() => router.push(`/projects/${projectId}/articles/new`)}
              icon={<PlusOutlined />}
            >
              New article
            </Button>
          </Flex>
        )
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

      <Tabs
        defaultActiveKey="articles"
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
