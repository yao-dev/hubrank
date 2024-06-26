'use client';;
import { Button, Flex, Grid, Typography } from 'antd';
import { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import WritingStyleForm from '@/components/WritingStyleForm/WritingStyleForm';
import WritingStylesTable from '@/components/WritingStylesTable/WritingStylesTable';

export default function ProjectDetail({
  params,
}: {
  params: { project_id: number }
}) {
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const screens = Grid.useBreakpoint();

  return (
    <Flex vertical gap="large">
      <WritingStyleForm opened={isWritingStyleModalOpened} setModalOpen={setIsWritingStyleModalOpened} />
      <Flex
        gap="middle"
        justify="space-between"
        align="center"
      >
        <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Writing style</Typography.Title>
        {screens.xs ? (
          <Button
            type="primary"
            onClick={() => setIsWritingStyleModalOpened(true)}
            icon={<PlusOutlined />}
          >
            New
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={() => setIsWritingStyleModalOpened(true)}
            icon={<PlusOutlined />}
          >
            Add writing style
          </Button>
        )}
      </Flex>

      <WritingStylesTable setModalOpen={setIsWritingStyleModalOpened} />
    </Flex>
  );
}
