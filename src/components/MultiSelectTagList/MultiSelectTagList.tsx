'use client';
import { Tag } from "antd";

const MultiSelectTagList = ({
  field,
  options,
  selectedOptions = [],
  onAddTag
}: any) => {
  return options.map((option: any) => {
    const isChecked = selectedOptions.includes(option.label)
    return (
      <Tag.CheckableTag
        key={option.value}
        checked={isChecked}
        onChange={(checked) => onAddTag(selectedOptions, option.label, checked, field)}
        style={{ marginBottom: 3, cursor: "pointer", background: !isChecked ? "#fafafa" : undefined }}
      >
        {option.label}
      </Tag.CheckableTag>
    )
  })
}

export default MultiSelectTagList