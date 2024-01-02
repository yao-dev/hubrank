'use client';
import { useCallback, useState } from "react";
import { Flex, Skeleton, Pagination, Text, Image, Affix, Box } from '@mantine/core';
import ArticleRow from "../ArticleRow/ArticleRow";
import ArticleFilters from "../ArticleFilters/ArticleFilters";
import { useSearchParams } from "next/navigation";
import useBlogPosts from "@/hooks/useBlogPosts";
import NewArticleForm from "../NewArticleForm";
import EditNewArticleForm from "../EditNewArticleForm";
import NewArticleButton from "../NewArticleButton";

const defaultFilters = {
  query: '',
  page: 1
}

export default function BlogPostList() {
  const [filters, setFilters] = useState(defaultFilters);
  const { data, isLoading, isError } = useBlogPosts().getAll(filters);
  const params = useSearchParams();
  const tab = params.get("tab")
  const mode = params.get("mode")
  const article = params.get("article")

  const renderPagination = useCallback(() => {
    return (
      <Pagination value={filters.page} onChange={(page) => setFilters(prev => ({ ...prev, page }))} total={Math.ceil((data?.count || 1) / 25)} />
    )
  }, [filters.page, data?.count]);

  const renderEmptyState = () => {
    return (
      <Flex direction="column" h={460} justify="center" align="center" gap={50}>
        <Image
          w={500}
          src="/image-1.png"
        />
        <NewArticleButton />
      </Flex>
    )
  }

  if (tab !== "articles") return null;

  if (tab === "articles" && mode === "create" && !article) {
    return <NewArticleForm />
  }

  if (tab === "articles" && mode === "create" && !!article) {
    return <EditNewArticleForm articleId={+article} />
  }

  // if (!data?.count) {
  //   return renderEmptyState()
  // }

  return (
    <div>
      <Flex
        // justify="space-between"
        align="center"
        direction="row"
        mb="xl"
      >
        <ArticleFilters onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
        {!!data?.data?.length && (
          <Flex gap="md" ml="sm">
            <NewArticleButton withTooltip />
          </Flex>
        )}
      </Flex>

      {isLoading ? [...Array(10).keys()].map((_, index) => {
        return <Skeleton key={index} height={52} mb={12} radius="sm" />
      }) : null}

      {!isLoading && isError && <Text>Something went wrong</Text>}

      {!isLoading && !isError && !data?.data?.length ? renderEmptyState() : null}

      {!isLoading && !isError ? (
        <Box pb={56}>
          {data?.data?.map((article) => {
            return (
              <ArticleRow key={article.id} data={article} />
            )
          })}
        </Box>
      ) : null}

      {!!data?.data?.length && (
        <Affix position={{ right: 0, bottom: 0, left: 300 }} style={{ background: "#FFF", borderTop: '1px solid #dee2e6' }}>
          <Flex
            justify="end"
            p="md"
          >
            {renderPagination()}
          </Flex>
        </Affix>
      )}
    </div>
  )
}