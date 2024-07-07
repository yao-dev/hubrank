import { Image, Select, Space } from "antd"

const LanguageSelect = ({ languages = [], ...props }: any) => {
  return (
    <Select
      placeholder="Language"
      optionLabelProp="label"
      options={languages.map((p: any) => {
        return {
          ...p,
          label: (
            <Space>
              <Image
                src={p.image}
                width={25}
                height={25}
                preview={false}
              />
              {p.label}
            </Space>
          ),
          value: p.id
        }
      })}
      {...props}
    />
  )
}

export default LanguageSelect