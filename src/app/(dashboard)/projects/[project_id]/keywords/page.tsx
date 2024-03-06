'use client';;
import { Flex, Tabs, TabsProps, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import KeywordsTable from '@/components/KeywordsTable/KeywordsTable';

export default function Keywords({
  params,
}: {
  params: { project_id: number }
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "keyword-ideas")
  }, [searchParams]);

  const onChange = (key: string) => {
    router.push(`/projects/${params.project_id}/keywords?tab=${key}`)
  };

  const items: TabsProps['items'] = [
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
  ];

  return (
    <Flex vertical gap="small">
      <Flex
        gap="middle"
        justify="space-between"
        align="center"
      >
        <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Keywords</Typography.Title>
      </Flex>

      <Tabs
        defaultActiveKey="keyword-ideas"
        activeKey={activeTab}
        onChange={onChange}
        items={items}
      />
    </Flex>
  );
}
