'use client';
import { useCallback, useState } from "react";
import { Button, Flex, Skeleton, Pagination } from '@mantine/core';
import ArticleRow from "../ArticleRow/ArticleRow";
import ArticleFilters from "../ArticleFilters/ArticleFilters";
import useArticles from "@/hooks/useArticles";
import useProjectId from "@/hooks/useProjectId";
import useActiveTopicId from "@/hooks/useActiveTopicId";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const defaultFilters = {
  query: '',
  page: 1
}

export default function ArticleList() {
  const [filters, setFilters] = useState(defaultFilters);
  const projectId = useProjectId();
  const topicId = useActiveTopicId();
  const { data, isLoading, isError } = useArticles().getAll({ ...filters, project_id: projectId, topic_cluster_id: topicId });
  // const articleSettings = useArticleSettings()
  // const createBulkArticles = useCreateBulkArticles()
  const router = useRouter()

  const renderPagination = useCallback(() => {
    return (
      <Pagination value={filters.page} onChange={(page) => setFilters(prev => ({ ...prev, page }))} total={Math.ceil((data?.count || 1) / 25)} />
    )
  }, [filters.page, data?.count])

  if (isError) {
    return null;
  }

  return (
    <>
      {/* {articleSettings.modal()} */}
      {/* {createBulkArticles.modal()} */}

      <Flex
        justify="space-between"
        align="center"
        direction="row"
        mb="xl"
      >
        <ArticleFilters onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
        <Flex gap="md">
          {/* <Button variant="default" onClick={createBulkArticles.open}>Bulk mode</Button> */}
          <Button onClick={() => router.push(`${window.location.pathname}/new-articles`)} leftSection={<IconPlus />}>New articles</Button>
        </Flex>
      </Flex>

      {isLoading ? [...Array(10).keys()].map((_, index) => {
        return <Skeleton key={index} height={52} mb={12} radius="sm" />
      }) : data?.data?.map((article) => {
        return (
          <ArticleRow key={article.id} id={article.id} />
        )
      })}

      <Flex
        justify="end"
        mt="xl"
        mb="lg"
      >
        {renderPagination()}
      </Flex>

    </>
  )
}