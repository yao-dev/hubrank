'use client';;
import ArticleDetail from "@/components/ArticleDetail";
import BlogPostList from "@/components/BlogPostList/BlogPostList";
import CompetitorList from "@/components/CompetitorList/CompetitorList";
import NewProjectModal from "@/components/NewProjectModal";
import ProjectForm from "@/components/ProjectForm/ProjectForm";
import ProjectSelect from "@/components/ProjectSelect";
import TargetAudienceList from "@/components/TargetAudienceList/TargetAudienceList";
import TopicClusterList from "@/components/TopicClusterList/TopicClusterList";
import useActiveProject from "@/hooks/useActiveProject";
import useModal from "@/hooks/useModal";
import useProjects from "@/hooks/useProjects";

import { Button, Flex, Grid, Image, Tabs, Text, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const Dashboard = () => {
  const router = useRouter();
  const params = useSearchParams();
  const activeProject = useActiveProject();
  const { getOne, getAll } = useProjects();
  const { data: project, isLoading: isProjectLoading } = getOne(activeProject.id);
  const { data: projects, isLoading: isProjectsLoading } = getAll();
  const activeTab = params.get('tab');
  const mode = params.get('mode');
  const articleId = params.get('article');
  const [opened, { open: openCreateProject, close: closeCreateProject }] = useDisclosure(false);
  const modal = useModal();

  useEffect(() => {
    if (activeTab === "topics" && mode === "create") {
      modal.open("create_topic");
    }
    if (activeTab === "audiences" && mode === "create") {
      modal.open("create_audience");
    }
    if (activeTab === "competitors" && mode === "create") {
      modal.open("create_competitor");
    }
  }, [activeTab, mode]);

  if (isProjectsLoading || isProjectLoading) {
    return null;
  }


  if (!projects?.length) {
    // show empty state
    return (
      <div>
        <NewProjectModal opened={opened} onClose={closeCreateProject} />

        <Flex direction="column" justify="center" align="center" gap="sm">
          <Flex h="50vh" justify="center" align="center">
            <Image
              w={500}
              src="/image-5.png"
            />
          </Flex>
          <Button onClick={openCreateProject} rightSection={<IconPlus />}>New project</Button>
        </Flex>
      </div>
    )
  }

  if (!project) {
    // show select project
    return (
      <div>
        <NewProjectModal opened={opened} onClose={closeCreateProject} />

        <Flex direction="column" justify="center" align="center" gap="md">
          <Flex h="50vh" justify="center" align="center">
            <Image
              w={500}
              src="/image-5.png"
            />
          </Flex>
          <ProjectSelect />
          <Text fw="bold">or</Text>
          <Button onClick={openCreateProject} rightSection={<IconPlus />}>New project</Button>
        </Flex>
      </div>
    )
  }

  if (activeTab === "articles" && mode === "edit" && articleId) {
    return <ArticleDetail id={articleId} />
  }

  return (
    <div>
      <NewProjectModal opened={opened} onClose={closeCreateProject} />

      <Flex direction="row" justify="space-between" align="center" mb="xl">
        <Title order={2}>{project.name}</Title>
        <Button onClick={openCreateProject} rightSection={<IconPlus />}>New project</Button>
      </Flex>
      <Tabs
        defaultValue="articles"
        keepMounted
        variant="pills"
        value={activeTab as string}
        onChange={(value) => router.push(`?tab=${value}`)}
      >
        <Tabs.List>
          <Tabs.Tab value="articles">
            Articles
          </Tabs.Tab>
          <Tabs.Tab value="topics">
            Topics
          </Tabs.Tab>
          <Tabs.Tab value="audiences">
            Target audiences
          </Tabs.Tab>
          <Tabs.Tab value="competitors">
            Competitors
          </Tabs.Tab>
          <Tabs.Tab value="settings">
            Settings
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="articles" pt="lg">
          <BlogPostList />
        </Tabs.Panel>
        <Tabs.Panel value="topics" pt="lg">
          <TopicClusterList />
        </Tabs.Panel>
        <Tabs.Panel value="audiences" pt="lg">
          <TargetAudienceList />
        </Tabs.Panel>
        <Tabs.Panel value="competitors" pt="lg">
          <CompetitorList />
        </Tabs.Panel>
        <Tabs.Panel value="settings" pt="lg">
          <Grid>
            <Grid.Col span={6}>
              <ProjectForm />
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default Dashboard