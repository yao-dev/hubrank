'use client';;
import AddCompetitorsForm from "@/components/AddCompetitorsForm/AddCompetitorsForm";
import HtmlHeadTagsForm from "@/components/HtmlHeadTagsForm/HtmlHeadTagsForm";
import MetatagsPreview from "@/components/MetatagsPreview/MetatagsPreview";
import ProjectForm from "@/components/ProjectForm/ProjectForm";
import useHtmlTagsForm from "@/hooks/useHtmlTagsForm";
import useProjects from "@/hooks/useProjects";
import { Flex, Grid, Image, Tabs, Text } from "@mantine/core";
import { IconApps, IconArrowLeft, IconCode, IconFolder, IconSettings } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function ProjectSettings({
  params,
}: {
  params: { project_id: number }
}) {
  const metatagsForm = useHtmlTagsForm();
  const router = useRouter();
  const projects = useProjects();
  const { data: project } = projects.getOne(params.project_id)

  const canGoBack = history?.length > 1;

  if (!project) return null;

  return (
    <div>
      <Flex direction="row" align="center" justify="space-between" w="auto" gap="sm" mb="lg">
        <Flex onClick={() => canGoBack ? router.back() : router.push(`/projects/${params.project_id}`)} direction="row" align="center" w="auto" gap="sm" style={{ cursor: 'pointer', opacity: 1 }}>
          <IconArrowLeft />
          <Image
            src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${project
              ?.website}&size=128`}
            width={128 / 5}
            height={128 / 5}
            alt={project.name}
          />
          <Text>{project.name}</Text>
        </Flex>
      </Flex>

      <Grid>
        <Grid.Col span={6}>
          <Tabs
            defaultValue="project"
            variant="pills"
            keepMounted={false}
            mt="xl"
          >
            <Tabs.List>
              <Tabs.Tab
                value="project"
                leftSection={<IconFolder />}
              >
                Project
              </Tabs.Tab>
              <Tabs.Tab
                value="competitors"
                leftSection={<IconApps />}
              >
                Competitors
              </Tabs.Tab>
              <Tabs.Tab
                value="seo"
                leftSection={<IconSettings />}
              >
                SEO
              </Tabs.Tab>
              <Tabs.Tab
                value="code"
                leftSection={<IconCode />}
              >
                Code
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="project" pt="xl">
              <ProjectForm />
            </Tabs.Panel>
            <Tabs.Panel value="competitors" pt="xl">
              <AddCompetitorsForm />
            </Tabs.Panel>
            <Tabs.Panel value="seo" pt="xl">
              <HtmlHeadTagsForm form={metatagsForm} />
            </Tabs.Panel>
            <Tabs.Panel value="code" pt="xl">
              <MetatagsPreview values={metatagsForm.values} />
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </div>
  )
}