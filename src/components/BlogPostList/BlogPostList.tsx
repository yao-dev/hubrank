'use client';;
import { useCallback, useState } from "react";
import { Button, Flex, Skeleton, Pagination, Text } from '@mantine/core';
import ArticleRow from "../ArticleRow/ArticleRow";
import ArticleFilters from "../ArticleFilters/ArticleFilters";
import useArticles from "@/hooks/useArticles";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import useBlogPosts from "@/hooks/useBlogPosts";

const defaultFilters = {
  query: '',
  page: 1
}

export default function BlogPostList() {
  const [filters, setFilters] = useState(defaultFilters);
  const { data, isLoading, isError } = useBlogPosts().getAll({ ...filters });
  const router = useRouter()

  const renderPagination = useCallback(() => {
    return (
      <Pagination value={filters.page} onChange={(page) => setFilters(prev => ({ ...prev, page }))} total={Math.ceil((data?.count || 1) / 25)} />
    )
  }, [filters.page, data?.count])

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        direction="row"
        mb="xl"
      >
        <ArticleFilters onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
        <Flex gap="md">
          <Button onClick={() => router.push(`${window.location.pathname}/new`)} leftSection={<IconPlus />}>New article</Button>
        </Flex>
      </Flex>

      {isLoading ? [...Array(10).keys()].map((_, index) => {
        return <Skeleton key={index} height={52} mb={12} radius="sm" />
      }) : null}

      {!isLoading && isError && <Text>Something went wrong</Text>}

      {!isLoading && !isError ? data?.data?.map((article) => {
        return (
          <ArticleRow key={article.id} id={article.id} />
        )
      }) : null}

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