'use client';;
import ArticlesTable from "@/components/ArticlesTable/ArticlesTable";
import useBlogPosts from "@/hooks/useBlogPosts";
import { useRouter } from "next/navigation";
import { Button, Flex, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const Articles = ({
  params,
}: {
  params: { project_id: number }
}) => {
  const projectId = +params.project_id;
  const router = useRouter();
  const { getAll } = useBlogPosts()
  const { refetch: refetchArticles, isRefetching } = getAll({ queue: false });

  return (
    <Flex vertical gap="large">
      <Flex
        gap="middle"
        justify="space-between"
        align="center"
      >
        <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Articles</Typography.Title>
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
      </Flex>

      <ArticlesTable />
    </Flex>
  )
}

export default Articles