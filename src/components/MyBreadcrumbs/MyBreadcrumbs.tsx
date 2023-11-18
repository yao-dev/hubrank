
import Link from "next/link";
import useProjectId from "@/hooks/useProjectId";
import useActiveTopicId from "@/hooks/useActiveTopicId";
import useActiveArticleId from "@/hooks/useActiveArticleId";
import useProjects from "@/hooks/useProjects";
import useTopicClusters from "@/hooks/useTopicClusters";
import useArticles from "@/hooks/useArticles";
import { useEffect, useState } from "react";
import { Flex, Text } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const MyBreadcrumbs = () => {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([]);
  const activeProjectId = useProjectId();
  const activeTopicId = useActiveTopicId();
  const articleId = useActiveArticleId();
  const { data: project } = useProjects().getOne(activeProjectId)
  const { data: topic } = useTopicClusters().getOne(activeTopicId)
  const { data: article } = useArticles().getOne(articleId)

  const shrinkAnchor = (value: string) => {
    if (value.length > 30) {
      return value.slice(0, 30) + '...'
    }

    return value
  }

  useEffect(() => {
    const anchorItems = []

    anchorItems.push(
      <Flex key="projects" align="center" style={{ marginRight: 5 }}>
        <Flex align="center" style={{ marginRight: 5 }}>
          <Text size="sm" fw={!project?.id ? 'bold' : 'normal'} component={Link} href={"/projects"} style={{ cursor: !project?.id ? "default" : 'pointer' }}>
            Projects
          </Text>
        </Flex>
        {project?.id ? '/' : ''}
      </Flex>
    )

    if (project?.id) {
      anchorItems.push(
        <Flex key={project.name} align="center" style={{ marginRight: 5 }}>
          <Flex align="center" style={{ marginRight: 5 }}>
            <Text size="sm" fw={!topic?.id ? 'bold' : 'normal'} component={Link} href={`/projects/${project.id}`} style={{ cursor: !topic?.id ? "default" : 'pointer' }}>
              {shrinkAnchor(project.name)}
            </Text>
          </Flex>
          {topic?.id ? '/' : ''}
        </Flex>
      )
    }

    if (project?.id && topic?.id) {
      anchorItems.push(
        <Flex key={topic.name} align="center" style={{ marginRight: 5 }}>
          <Text size="sm" fw={!article?.id ? 'bold' : 'normal'} component={Link} href={`/projects/${project.id}/topic-cluster/${topic.id}`} style={{ cursor: !article?.id ? "default" : 'pointer', marginRight: 5 }}>
            {shrinkAnchor(topic.name)}
          </Text>
          {article?.id ? '/' : ''}
        </Flex>
      )
    }

    if (project?.id && topic?.id && article?.id) {
      anchorItems.push(
        <Flex key={article.title} align="center">
          <Text size="sm" fw="bold">
            {shrinkAnchor(article.title)}
          </Text>
        </Flex>
      )
    }

    setItems(anchorItems)
  }, [project, topic, article])

  return (
    <Flex gap="lg">
      <Flex align="center" onClick={() => router.back()}>
        <IconChevronLeft size={18} />
        <Text size="sm">Back</Text>
      </Flex>
      <Flex align="center">
        {items}
      </Flex>
    </Flex>
  )
}

export default MyBreadcrumbs