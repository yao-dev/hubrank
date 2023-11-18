'use client';
import { Flex, Title } from "@mantine/core";

export default function PlanAndBilling() {
  return (
    <div>
      <Flex
        gap="md"
        justify="space-between"
        align="center"
        direction="row"
        mb="xl"
      >
        <Title order={2}>Plan & Billing</Title>
      </Flex>
    </div>
  )
}