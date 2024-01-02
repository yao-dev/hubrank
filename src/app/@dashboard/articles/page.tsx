'use client';
import BlogPostList from "@/components/BlogPostList/BlogPostList";
import { Button, Flex, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

export default function Articles() {
  const router = useRouter()

  return (
    <div>
      <Flex
        justify="space-between"
        align="center"
        direction="row"
        mb="xl"
      >
        <Title order={2} fw="bold">Articles</Title>
        <Button onClick={() => router.push(`${window.location.pathname}/new`)} leftSection={<IconPlus />}>New article</Button>
      </Flex>

      <BlogPostList />
    </div>
  )
}