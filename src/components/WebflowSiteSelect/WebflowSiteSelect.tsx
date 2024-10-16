import { Select } from "antd";

type Props = {
  options: { label: string; value: string }[];
}

const WebflowSiteSelect = ({ options = [], ...props }: Props) => {
  return (
    <Select
      placeholder="Select a site"
      optionLabelProp="label"
      options={options}
      {...props}
    />
  )
}

export default WebflowSiteSelect