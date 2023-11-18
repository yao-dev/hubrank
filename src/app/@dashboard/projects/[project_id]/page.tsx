'use client';;
import { Badge, Flex, Text, Title, Image, Button } from '@mantine/core';
import TopicClusterList from "../../../../components/TopicClusterList/TopicClusterList";
import { IconCheck } from "@tabler/icons-react";
import useProjects from "@/hooks/useProjects";
import Link from "next/link";
import { modals } from '@mantine/modals';
import { useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import MyBreadcrumbs from '@/components/MyBreadcrumbs/MyBreadcrumbs';

const tabs = {
  topic_clusters: {
    name: 'Topic clusters',
    value: 'topic-clusters'
  },
  articles: {
    name: 'Articles',
    value: 'articles'
  },
}

const TabBadge = ({ count, selected }: { count: number, selected: boolean }) => {
  return (
    <Badge
      w={24}
      h={24}
      variant="filled"
      size="ld"
      p={0}
      style={[{ pointerEvents: 'none' }, { background: 'white', color: 'black' }]}
    >
      {count}
    </Badge>
  )
}

export default function ProjectDetail({
  params,
}: {
  params: { project_id: number }
}) {
  const router = useRouter();
  const projectId = params.project_id;
  const { getOne, delete: deleteProject } = useProjects()
  const {
    data: project,
    isLoading,
    isError
  } = getOne(projectId);

  const onDeleteProject = () => {
    modals.openConfirmModal({
      title: <Text size="xl" fw="bold">Delete project</Text>,
      withCloseButton: false,
      labels: {
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      onConfirm() {
        deleteProject.mutate(params.project_id as number);
        notifications.show({
          title: 'All good!',
          message: 'Your project was deleted.',
          color: 'green',
          icon: <IconCheck size="1rem" />
        })
        router.replace('/projects')
      },
      confirmProps: {
        color: 'red'
      },
      children: (
        <Text size="sm">Are you sure you want to delete <b>{project?.name}</b>?</Text>
      )
    })
  }

  if (isError) {
    return null;
  }

  if (isLoading) {
    // TODO: show skeleton
    return null;
  }


  return (
    <div>

      <Flex direction="row" align="center" justify="space-between" w="auto" gap="sm" mb="lg">
        <MyBreadcrumbs />

        <Flex direction="row" align="center" gap="sm">
          <Button
            component={Link}
            prefetch={false}
            href={`/projects/${projectId}/settings`}
            variant="outline"
            color="dark"
          >
            Edit
          </Button>

          <Button variant='outline' color='red' onClick={onDeleteProject}>
            Delete
          </Button>
        </Flex>
      </Flex>

      <Flex direction="row" gap="md" align="center" mb="xl">
        <Image
          src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${project.website}&size=128`}
          width={128 / 4}
          height={128 / 4}
          alt={project.name}
        />
        <Title order={2}>{project.name}</Title>
      </Flex>

      <TopicClusterList />

      {/* <Tabs
        value={hash}
        onChange={(value) => {
          router.replace(window.location.pathname, { scroll: false })
          setTimeout(() => {
            setHash(value)
          }, 10)
        }}
        variant="default"
        style={{ marginTop: 32 }}
        keepMounted={false}
      >
        <Tabs.List>
          <Tabs.Tab
            value={tabs.topic_clusters.value}
            // leftSection={<IconBinaryTree2 />}
            rightSection={<TabBadge count={allTopicClusters.data?.count || 0} selected={hash === tabs.topic_clusters.value} />}
          >
            {tabs.topic_clusters.name}
          </Tabs.Tab>
          <Tabs.Tab
            value={tabs.articles.value}
            // leftSection={<IconFileDescription />}
            rightSection={<TabBadge count={allArticles.data?.count || 0} selected={hash === tabs.articles.value} />}
            disabled={!allTopicClusters.data?.count}
          >
            {tabs.articles.name}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value={tabs.topic_clusters.value} pt="xl">
          <TopicClusterList />
        </Tabs.Panel>
        <Tabs.Panel value={tabs.articles.value} pt="xl">
          <ArticleList />
        </Tabs.Panel>
      </Tabs> */}
    </div>
  );
}
