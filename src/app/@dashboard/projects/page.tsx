'use client';;
import { useState } from "react";
import { IconSettings, IconTrash } from '@tabler/icons-react';
import useProjects from "@/hooks/useProjects";
import { Typography, Button, Row, Col, Card, Image, Flex, Popconfirm, Spin } from "antd";
import {
  PlusOutlined
} from '@ant-design/icons';
import Link from "next/link";
import NewProjectModal from "@/components/NewProjectModal";

export default function Projects() {
  const projects = useProjects();
  const {
    data: projectList,
    isLoading,
    isError
  } = projects.getAll();

  const [openedCreateProject, setOpenCreateProject] = useState(false);

  if (isError) {
    return null;
  }

  return (
    <Spin spinning={isLoading}>
      <div>
        <NewProjectModal opened={openedCreateProject} onClose={() => setOpenCreateProject(false)} />

        <div>
          <Flex
            gap="middle"
            justify="space-between"
            align="center"
            style={{ marginBottom: 24 }}
          >
            <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Projects</Typography.Title>
            <Button type="primary" onClick={() => setOpenCreateProject(true)} icon={<PlusOutlined />}>New project</Button>
          </Flex>

          <Row gutter={16}>
            {projectList?.map((project) => {
              const description = project?.metatags?.description || project?.description || "No description.";
              return (
                <Col key={project.id} span={8} style={{ marginBottom: 24 }}>
                  <Card style={{ height: 180 }}>
                    <Link href={`/projects/${project.id}`}>
                      <Flex justify="space-between" style={{ marginBottom: 24 }}>
                        <Flex gap="middle" align="center">
                          <Image
                            src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${project.website}&size=128`}
                            width={128 / 3}
                            height={128 / 3}
                            alt={project.name}
                            preview={false}
                          />
                          <Typography.Title level={5} style={{ fontWeight: 600, margin: 0 }}>{project.name}</Typography.Title>
                        </Flex>

                        <Flex gap="small">
                          <Link href={`/projects/${project.id}/settings`} style={{ color: 'black' }}>
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
