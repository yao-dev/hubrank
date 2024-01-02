'use client';
import { Flex, Image, Text, Title } from "@mantine/core";

export default function Integrations() {
  return (
    <div>
      <Flex
        gap="md"
        justify="space-between"
        align="center"
        direction="row"
        mb="xl"
      >
        <Title order={2}>Integrations</Title>
      </Flex>
      <Flex direction="column" h={460} justify="center" align="center" gap={50}>
        <Image
          w={500}
          src="/image-4.png"
        />
        <Text size="md" fw="bold">This feature is coming soon</Text>
      </Flex>
    </div>
  )
}