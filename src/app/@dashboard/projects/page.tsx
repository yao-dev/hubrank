'use client';;
import { useState } from "react";
import { IconPlus, IconSettings, IconTrash } from '@tabler/icons-react';
import { useRouter } from "next/navigation";
import useProjects from "@/hooks/useProjects";
import {
  Typography,
  Button,
  Row,
  Col,
  Card,
  Image,
  Flex,
  Form,
  Input,
  Modal,
  Alert,
  Popconfirm,
} from "antd";
import Link from "next/link";


export default function ProjectList() {
  const [error, setError] = useState(false);
  const router = useRouter()
  const projects = useProjects();
  const {
    data: projectList,
    isLoading,
    isError
  } = projects.getAll();

  const [openedCreateProject, setOpenCreateProject] = useState(false);
  const [form] = Form.useForm();

  const onCreateProject = async (values: any) => {
    try {
      setError(false)
      const { data: project } = await projects.create.mutateAsync(values);
      router.push(`/projects/${project.id}`)
    } catch (e) {
      console.error(e)
      setError(true)
    }
  }

  const onCloseCreateProject = () => {
    setOpenCreateProject(false);
    form.resetFields();
  }

  if (isError) {
    return null;
  }

  if (isLoading) {
    return null;
  }

  return (
    <div>
      <Modal
        title="New project"
        open={openedCreateProject}
        onCancel={() => onCloseCreateProject()}
        onOk={() => form.submit()}
        okText="Create"
        confirmLoading={projects.create.isLoading}
        closable={!projects.create.isLoading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onCreateProject}
          initialValues={{
            name: "",
            website: "",
            description: "",
            seed_keyword: ""
            // target_audience: "",
          }}
        >
          {error && (
            <Alert message="Something went wrong! Try again please." type="error" showIcon style={{ marginBottom: 12 }} />
          )}
          <Form.Item name="name" label="Name" rules={[{ required: true, type: "string", max: 50, message: "Enter a project name" }]} hasFeedback>
            <Input placeholder="Name" count={{ show: true, max: 50 }} />
          </Form.Item>
          <Form.Item name="seed_keyword" label="Seed keyword" rules={[{ required: true, type: "string", max: 75, message: "Add a seed keyword" }]} hasFeedback>
            <Input placeholder="Seed keyword" count={{ show: true, max: 75 }} />
          </Form.Item>
          <Form.Item
            name="website"
            label="Website"
            validateTrigger="onBlur"
            rules={[{
              required: true,
              type: "url",
              message: "Enter a valid url",
              transform: (url: any) => {
                if (!url?.startsWith('https://')) {
                  url = `https://${url}`
                }
                return new URL(url).origin
              }
            }]}
            hasFeedback
          >
            <Input placeholder="https://google.com" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            help="We'll try to get the value from the meta description of your website"
            rules={[{
              required: false,
              type: "string",
              max: 200,
            }]}
            hasFeedback
          >
            <Input placeholder="Description" count={{ show: true, max: 200 }} />
          </Form.Item>

          <Form.Item />
          {/* <Form.Item name="target_audience" label="Target audience" rules={[{ required: false, type: "string", max: 150 }]}>
            <Input placeholder="Target audience" count={{ show: true, max: 150 }} />
          </Form.Item> */}
        </Form>
      </Modal>

      <div>
        <Flex
          gap="middle"
          justify="space-between"
          align="center"
          style={{ marginBottom: 24 }}
        >
          <Typography.Title level={2} style={{ margin: 0 }}>Projects</Typography.Title>
          <Button type="primary" onClick={() => setOpenCreateProject(true)} icon={<IconPlus size="1rem" />} style={{ display: 'flex', alignItems: 'center' }}>New project</Button>
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
              // <Grid.Col key={project.id} span={4}>
              //   <Card
              //     component={Link}
              //     prefetch={false}
              //     href={`/projects/${project.id}`}
              //     shadow="sm"
              //     padding="lg"
              //     radius="md"
              //     withBorder
              //     mih={180}
              //     mah={180}
              //     style={{ cursor: 'pointer' }}
              //   >
              //     <Flex direction="row" justify="space-between">
              //       <Flex direction="row" gap="md" align="center" mb="md">
              //         <Image
              //           src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${project.website}&size=128`}
              //           width={128 / 3}
              //           height={128 / 3}
              //           alt={project.name}
              //         />
              //         <Text size="xl" fw={700}>{project.name}</Text>
              //       </Flex>

              //       <ActionIcon
              //         component={Link}
              //         prefetch={false}
              //         href={`/projects/${project.id}/settings`}
              //         variant="transparent"
              //         color="dark"
              //       >
              //         <IconSettings size="1.5rem" />
              //       </ActionIcon>
              //     </Flex>

              //     <Text size="sm" color="dimmed">
              //       {description}
              //     </Text>
              //   </Card>
              // </Grid.Col>
            )
          })}
        </Row >
      </div >
    </div >
  );
}
