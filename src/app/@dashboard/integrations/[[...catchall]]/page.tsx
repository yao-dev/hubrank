'use client';

import IntegrationsTable from "@/components/IntegrationsTable/IntegrationsTable";
import { Flex, Typography } from "antd";

export default function Integrations() {
  return (
    <Flex vertical style={{ height: "100%" }} gap="middle">
      <Flex
        gap="md"
        justify="space-between"
        align="center"
      >
        <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Integrations</Typography.Title>

      </Flex>
      <IntegrationsTable />
      {/* <Flex vertical flex={1} justify="center" align="center" gap={50}>
        <Image
          preview={false}
          src="/image-4.png"
          width={460}
        />
        <Typography.Text>This feature is coming soon</Typography.Text>
      </Flex> */}
    </Flex>
  )
}