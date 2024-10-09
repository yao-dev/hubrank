'use client';;
import { useEffect, useState } from "react";
import { IconCircle, IconCircleCheckFilled, IconSettings, IconTrash } from '@tabler/icons-react';
import useProjects from "@/hooks/useProjects";
import {
  Typography,
  Button,
  Row,
  Col,
  Card,
  Image,
  Flex,
  Popconfirm,
  Spin,
  Empty,
  Grid,
  Modal,
} from "antd";
import {
  PlusOutlined
} from '@ant-design/icons';
import Link from "next/link";
import NewProjectModal from "@/components/NewProjectModal";
import PageTitle from "@/components/PageTitle/PageTitle";
import useUser from "@/hooks/useUser";
import { useRouter, useSearchParams } from "next/navigation";
import useProjectId from "@/hooks/useProjectId";
import { brandsLogo } from "@/brands-logo";
import supabase from "@/helpers/supabase/client";

export default function Dashboard() {
  const router = useRouter();
  const projectId = useProjectId();
  const searchParams = useSearchParams();
  const projects = useProjects();
  const {
    data: projectList,
    isPending,
    isError,
    isFetched,
    isLoading,
  } = projects.getAll();
  const screens = Grid.useBreakpoint();
  const user = useUser();

  const [openedCreateProject, setOpenCreateProject] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIntegrationLoading, setIsIntegrationLoading] = useState(false);
  const [selectedProjectForIntegration, setSelectedProjectForIntegration] = useState();

  const hasReachedLimit = projectList && user?.subscription?.projects_limit <= projectList?.length;

  useEffect(() => {
    if (searchParams.get("install_zapier")) {
      setIsModalOpen(true)
    }
  }, []);

  const onOpenNewProject = () => {
    // if (hasReachedLimit) {
    //   pricingModal.open(true, {
    //     title: "You've reached your projects limit",
    //     subtitle: "Upgrade to create more projects"
    //   })
    // } else {
    //   setOpenCreateProject(true)
    // }
    setOpenCreateProject(true)
  }

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
        <NewProjectModal opened={openedCreateProject} onClose={() => setOpenCreateProject(false)} />
        <Empty
          // TODO: replace with a folder image
          image="https://usehubrank.com/empty-state/empty-blog-posts.png"
          imageStyle={{ height: screens.xs ? 125 : 200 }}
          description={(
            <Typography.Text style={{ margin: 0, position: "relative", top: 15 }}>
              You have no projects yet
            </Typography.Text>
          )}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
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
        <Modal
          open={isModalOpen}
          centered
          closable={false}
          title="New integration"
          okText="Create integration"
          maskClosable={false}
          onCancel={() => {
            router.push("/")
          }}
          confirmLoading={isIntegrationLoading}
          okButtonProps={{
            disabled: !selectedProjectForIntegration
          }}
          onOk={async () => {
            if (selectedProjectForIntegration?.id) {
              setIsIntegrationLoading(true)
              const { data: newIntegration } = await supabase.from("integrations").insert({ user_id: user.id, project_id: selectedProjectForIntegration.id, platform: "zapier" }).select().maybeSingle()

              const query = {
                client_id: searchParams.get("client_id"),
                state: searchParams.get("state"),
                code: newIntegration.id
              };

              const urlEncoded = new URLSearchParams();
              if (query.client_id) urlEncoded.append('client_id', query.client_id);
              if (query.state) urlEncoded.append('state', query.state);
              urlEncoded.append('code', query.code);
              const redirectUrl = `${searchParams.get("redirect_uri")}?${urlEncoded.toString()}`;

              router.push(redirectUrl);
            }
          }}
        >
          <p className='m-0 text-center'>
            <Image
              src={brandsLogo.zapier}
              height={50}
              preview={false}
            />
          </p>
          {/* <p className='text-center text-base mt-6 mb-10'>Zapier is requesting access to {project ? <b>{project.name}</b> : "your Hubrank account"}</p> */}
          <p className='text-center text-base mt-6 mb-10'>Zapier is requesting access to your Hubrank account, select a project to continue.</p>
          <div className="flex flex-col gap-4">
            {projectList?.map((project) => {
              return (
                <div
                  key={project.id}
                  className={`cursor-pointer flex flex-row gap-2 border items-center rounded-md justify-between p-4 hover:border-primary-500 ${selectedProjectForIntegration?.id === project.id && "border-primary-500"}`}
                  onClick={() => setSelectedProjectForIntegration(project)}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <Image
                      src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${project.website}&size=128`}
                      width={30}
                      height={30}
                      preview={false}
                    />
                    <p className="text-base">{project.name}</p>
                  </div>

                  {selectedProjectForIntegration?.id === project.id ? <IconCircleCheckFilled stroke={1.5} className="text-primary-500" /> : <IconCircle stroke={1.5} color="grey" />}
                </div>
              )
            })}
          </div>
        </Modal>
        <div>
          <Flex
            gap="middle"
            justify="space-between"
            align="center"
            style={{ marginBottom: 24 }}
          >
            <PageTitle title="Dashboard" />
            <Button
              disabled={projectList?.length >= 5}
              type="primary"
              onClick={onOpenNewProject}
              icon={<PlusOutlined />}
            >
              {screens.xs ? "New" : "New project"}
            </Button>
          </Flex>

          <Row gutter={16}>
            {projectList?.map((project) => {
              const description = project?.metatags?.description || project?.description || "No description.";
              return (
                <Col key={project.id} xs={24} md={12} xl={8} style={{ marginBottom: 24 }}>
                  <Card style={{ height: 180 }}>
                    <Link
                      href={`/projects/${project.id}?tab=blog-posts`}
                      prefetch
                    >
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
