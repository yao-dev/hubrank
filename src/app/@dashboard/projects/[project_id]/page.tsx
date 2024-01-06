'use client';
import { Button, Empty, Flex, Space } from 'antd';
import { useEffect, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import { useRouter } from 'next/navigation';
import NewArticleDrawer from '@/components/NewArticleDrawer/NewArticleDrawer';

export default function ProjectDetail({
  params,
}: {
  params: { project_id: number }
}) {
  const [articleDrawerOpen, setArticleDrawerOpen] = useState(false);
  const { data: project, isFetched } = useProjects().getOne(+params.project_id);
  const router = useRouter();

  useEffect(() => {
    if (isFetched && !project) {
      router.replace('/projects');
    }
  }, [project, isFetched]);

  if (isFetched && !project) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <NewArticleDrawer open={articleDrawerOpen} onClose={() => setArticleDrawerOpen(false)} />
      {/* <Button style={{ width: 'fit-content' }} onClick={() => setArticleDrawerOpen(true)}>new article</Button> */}
      <Flex align='center' justify='center' style={{ display: "flex", flex: "1 1 auto" }}>
        <Empty
          image="/image-1.png"
          imageStyle={{ height: 200 }}
          description="You have no articles yet"
        // description={
        //   <span>
        //     Customize <a href="#API">Description</a>
        //   </span>
        // }
        >
          <Space>
            <Button type="primary">Get article ideas</Button>
            {/* <Typography.Text>or</Typography.Text> */}
            <Button onClick={() => setArticleDrawerOpen(true)}>Create a single article</Button>
          </Space>
        </Empty>
      </Flex>
    </div>
  );
}
