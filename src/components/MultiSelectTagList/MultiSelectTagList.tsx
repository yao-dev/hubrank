'use client';;
import { Tag } from "antd";
import { useState } from "react";

const MultiSelectTagList = ({
  field,
  options,
  selectedOptions = [],
  onAddTag
}: any) => {
  const [show, setShow] = useState(true);
  return (
    <div style={{ position: "relative" }}>
      <span
        style={{ position: "absolute", top: show ? -30 : -46, right: 12 }}
        onClick={() => setShow(!show)}
      >
        {show ? "hide" : "show"}
      </span>
      {show && options.map((option: any) => {
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
      })}
    </div>
  )
}

export default MultiSelectTagList