'use client';
import { Button, Tabs, TabsProps } from 'antd';
import { useEffect, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import { useRouter, useSearchParams } from 'next/navigation';
import NewArticleDrawer from '@/components/NewArticleDrawer/NewArticleDrawer';
import KeywordsTable from '@/components/KeywordsTable/KeywordsTable';
import ArticlesTable from '@/components/ArticlesTable/ArticlesTable';
import { PlusOutlined } from '@ant-design/icons';

export default function ProjectDetail({
  params,
}: {
  params: { project_id: number }
}) {
  const [articleDrawerOpen, setArticleDrawerOpen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const { data: project, isFetched } = useProjects().getOne(+params.project_id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || undefined)

  useEffect(() => {
    if (isFetched) {
      if (!project?.id) {
        router.replace('/projects');
      } else {
        router.replace(`/projects/${project.id}?tab=articles`);
      }
    }
  }, [project, isFetched]);

  useEffect(() => {
    if (!articleDrawerOpen) {
      setSelectedKeyword("")
    }
  }, [articleDrawerOpen])

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
        <ArticlesTable setArticleDrawerOpen={setArticleDrawerOpen} setSelectedKeyword={setSelectedKeyword} />
      ),
    },
    {
      key: 'keyword-ideas',
      label: 'Keyword ideas',
      children: (
        <KeywordsTable setArticleDrawerOpen={setArticleDrawerOpen} setSelectedKeyword={setSelectedKeyword} />
      ),
    },
    {
      key: 'saved-keywords',
      label: 'Saved keywords',
      children: (
        <KeywordsTable editMode setArticleDrawerOpen={setArticleDrawerOpen} setSelectedKeyword={setSelectedKeyword} />
      ),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <NewArticleDrawer selectedKeyword={selectedKeyword} open={articleDrawerOpen} onClose={() => setArticleDrawerOpen(false)} />

      <Tabs
        defaultActiveKey="1"
        activeKey={activeTab}
        onChange={onChange}
        items={items}
        tabBarExtraContent={{
          right: (
            <Button
              type="primary"
              onClick={() => setArticleDrawerOpen(true)}
              icon={<PlusOutlined />}
            >
              Create article
            </Button>
          )
        }}
      />
    </div>
  );
}
