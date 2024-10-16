import { brandsLogo } from "@/brands-logo";
import { IconWebhook } from "@tabler/icons-react";
import { Flex, Image, Select } from "antd";

const AutoPublishIntegrationSelect = ({ integrations = [], ...props }: any) => {
  return (
    <Select
      placeholder="Select an integration"
      optionLabelProp="label"
      options={integrations?.map((item: any) => {
        return {
          ...item,
          label: (
            <Flex align="center" gap={6}>
              {item.platform === "webhook" ? (
                <IconWebhook />
              ) : (
                <Image
                  src={brandsLogo[item.platform]}
                  width={25}
                  height={25}
                  preview={false}
                />
              )}
              {item.name}
            </Flex>
          ),
          value: item.id
        }
      })}
      {...props}
    />
  )
}

export default AutoPublishIntegrationSelect