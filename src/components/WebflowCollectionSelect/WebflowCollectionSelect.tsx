import { Select } from "antd";

type Props = {
  options?: { label: string; value: string }[]
}

const WebflowCollectionSelect = ({ options = [], ...props }: Props) => {
  return (
    <Select
      placeholder="Select a collection"
      optionLabelProp="label"
      options={options}
      {...props}
    />
  )
}

export default WebflowCollectionSelect