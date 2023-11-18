import BlogPostList from "@/components/BlogPostList/BlogPostList";
import { Flex, Title } from "@mantine/core";

export default function Articles() {
  return (
    <div>
      <Flex mb="xl">
        <Title order={2} fw="bold">Articles</Title>
      </Flex>

      <BlogPostList />
    </div>
  )
}