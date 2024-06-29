'use client';;
import { useState } from "react";
import { IconSettings, IconTrash } from '@tabler/icons-react';
import useProjects from "@/hooks/useProjects";
import { Typography, Button, Row, Col, Card, Image, Flex, Popconfirm, Spin, Empty, Grid } from "antd";
import {
  PlusOutlined
} from '@ant-design/icons';
import Link from "next/link";
import NewProjectModal from "@/components/NewProjectModal";

export default function Dashboard() {
  const projects = useProjects();
  const {
    data: projectList,
    isPending,
    isError,
    isFetched,
    isLoading,
  } = projects.getAll();
  const screens = Grid.useBreakpoint();

  const [openedCreateProject, setOpenCreateProject] = useState(false);

  if (isError) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ width: "100%", height: "100vh" }}>
        <Flex align="center" justify="center">
          <Spin spinning />
        </Flex>
      </div>
    )
  }

  if (!isPending && isFetched && !projectList?.length) {
    return (
      <Flex align='center' justify='center' style={{ marginTop: 96 }}>
        <Empty
          image="/image-1.png"
          imageStyle={{ height: screens.xs ? 125 : 200 }}
          description="You have no projects yet"
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            // onClick={() => setArticleDrawerOpen(true)}
            onClick={() => setOpenCreateProject(true)}
            style={{ marginTop: 12 }}
          >
            New project
          </Button>
        </Empty>
      </Flex>
    )
  }

  return (
    <Spin spinning={isPending}>
      <div>
        <NewProjectModal opened={openedCreateProject} onClose={() => setOpenCreateProject(false)} />

        <div>
          <Flex
            gap="middle"
            justify="space-between"
            align="center"
            style={{ marginBottom: 24 }}
          >
            <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Dashboard</Typography.Title>
            <Button type="primary" onClick={() => setOpenCreateProject(true)} icon={<PlusOutlined />}>
              {screens.xs ? "New" : "New project"}
            </Button>
          </Flex>

          <Row gutter={16}>
            {projectList?.map((project) => {
              const description = project?.metatags?.description || project?.description || "No description.";
              return (
                <Col key={project.id} xs={24} md={12} xl={8} style={{ marginBottom: 24 }}>
                  <Card style={{ height: 180 }}>
                    <Link href={`/projects/${project.id}/articles`} prefetch>
                      <Flex justify="space-between" style={{ marginBottom: 24 }}>
                        <Flex gap="middle" align="center">
                          <Image
                            src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${project.website}&size=128`}
                            width={128 / 3}
                            height={128 / 3}
                            preview={false}
                          />
                          <Typography.Title level={5} style={{ fontWeight: 600, margin: 0 }}>{project.name}</Typography.Title>
                        </Flex>

                        <Flex gap="small">
                          <Link href={`/projects/${project.id}/settings`} prefetch style={{ color: 'black' }}>
                            <IconSettings size="1.4rem" stroke={1.5} />
                          </Link>
                          <Popconfirm
                            title="Delete project"
                            description={`Are you sure to delete ${project.name}?`}
                            onConfirm={(e) => {
                              e?.preventDefault()
                              projects.delete.mutate(project.id)
                            }}
                            onCancel={(e) => {
                              e?.preventDefault()
                            }}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{
                              danger: true
                            }}
                          >
                            <IconTrash onClick={(e) => e.preventDefault()} size="1.4rem" stroke={1.5} />
                          </Popconfirm>
                        </Flex>
                      </Flex>

                      <Typography.Paragraph ellipsis={{ rows: 3, expandable: false, symbol: 'more' }}>
                        {description}
                      </Typography.Paragraph>
                    </Link>
                  </Card>
                </Col>
              )
            })}
          </Row >
        </div >
      </div >
    </Spin>
  );
}
