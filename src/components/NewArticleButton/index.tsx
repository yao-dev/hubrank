import { Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const NewArticleButton = ({ withTooltip }: { withTooltip?: boolean }) => {
  // const { data: topics } = useTopicClusters().getAll({ page: 1 });
  // const { data: audiences } = useTargetAudiences().getAll({ page: 1 });
  const router = useRouter();

  // if (!topics?.count || !audiences?.count) {
  //   if (withTooltip) {
  //     return (
  //       <Tooltip label="You must have a least one topic and a target audience to create an article">
  //         <Button disabled onClick={() => router.push("?tab=articles&mode=create")} rightSection={<IconPlus />}>New article</Button>
  //       </Tooltip>
  //     )
  //   }

  //   return (
  //     <Flex direction="column" align="center" justify="center" gap="md">
  //       <Button disabled onClick={() => router.push("?tab=articles&mode=create")} rightSection={<IconPlus />}>New article</Button>
  //       <Text size="sm" c="blue">You must have a least one topic and a target audience to create an article</Text>
  //     </Flex>
  //   )
  // }

  return (
    <Button onClick={() => router.push("project/4/articles/new")} rightSection={<IconPlus />}>New article</Button>
  )
}

export default NewArticleButton