import { Flex, Image, Select } from "antd";

const LanguageSelect = ({ languages = [], ...props }: any) => {
  return (
    <Select
      placeholder="Language"
      optionLabelProp="label"
      options={languages.map((p: any) => {
        return {
          ...p,
          label: (
            <Flex align="center" gap={6}>
              <Image
                src={p.image}
                width={25}
                height={25}
                preview={false}
              />
              {p.label}
            </Flex>
          ),
          value: p.id
        }
      })}
      {...props}
    />
  )
}

export default LanguageSelect