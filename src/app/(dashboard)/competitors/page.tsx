'use client';
import { Flex, Title } from "@mantine/core";

export default function Competitors() {
  return (
    <div>
      <Flex
        gap="md"
        justify="space-between"
        align="center"
        direction="row"
        mb="xl"
      >
        <Title order={2}>Competitors</Title>
      </Flex>
    </div>
  )
}