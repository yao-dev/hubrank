"use client"
import { compact, isEmpty } from "lodash";
import { Button, Divider, Flex, Form, Segmented, Select, Tag } from "antd";
import Label from "../Label/Label";
import useWritingStyles from "@/hooks/useWritingStyles";
import MultiSelectTagList from "../MultiSelectTagList/MultiSelectTagList";
import {
  emotions,
  instructionalElements,
  perspectives,
  purposes,
  sentenceStructures,
  tones,
  vocabularies,
  writingStructures,
} from "@/options";
import { useState } from "react";
import WritingStyleForm from "../WritingStyleForm/WritingStyleForm";
import { PlusOutlined } from '@ant-design/icons';

const WritingStyleSelect = ({ form }: any) => {
  const { data: writingStyles } = useWritingStyles().getAll();
  const fieldCustomWritingId = Form.useWatch("writing_style_id", form);
  const fieldTones = Form.useWatch("tones", form);
  const fieldPurposes = Form.useWatch("purposes", form);
  const fieldEmotions = Form.useWatch("emotions", form);
  const fieldVocabularies = Form.useWatch("vocabularies", form);
  const fieldSentenceStructures = Form.useWatch("sentence_structures", form);
  const fieldPerspectives = Form.useWatch("perspectives", form);
  const fieldWritingStructures = Form.useWatch("writing_structures", form);
  const fieldInstructionalElements = Form.useWatch("instructional_elements", form);
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);

  const onAddTag = (list: string[], tag: string, checked: boolean, field: string) => {
    const nextSelectedTags = checked
      ? [...list, tag]
      : list.filter((t) => t !== tag);
    form.setFieldValue(field, nextSelectedTags);
  }

  return (
    <>
      <WritingStyleForm
        opened={isWritingStyleModalOpened}
        setModalOpen={setIsWritingStyleModalOpened}
        initialValues={{
          tones: fieldTones,
          purposes: fieldPurposes,
          emotions: fieldEmotions,
          vocabularies: fieldVocabularies,
          sentence_structures: fieldSentenceStructures,
          perspectives: fieldPerspectives,
          writing_structures: fieldWritingStructures,
          instructional_elements: fieldInstructionalElements,
        }}
      />
      <Form.Item
        name="writing_mode"
        label={<Label name="Writing style" />}
        rules={[{ required: true }]}
        style={{ marginBottom: 12 }}
      >
        <Segmented options={[{ label: "Custom", value: "custom" }, { label: "Manual", value: "manual" }]} style={{ width: "fit-content" }} />
      </Form.Item>

      <Form.Item
        style={{ marginBottom: 12 }}
        shouldUpdate={(prevValues, currentValues) => {
          return prevValues.writing_mode !== currentValues.writing_mode || prevValues.writing_style_id !== currentValues.writing_style_id
        }}
      >
        {({ getFieldValue }) => {
          if (getFieldValue('writing_mode') === "custom") {
            const customWritingStyle = writingStyles?.data?.filter((i) => i.id === fieldCustomWritingId)?.[0];
            const characteristics = fieldCustomWritingId ? compact([
              customWritingStyle.tones,
              customWritingStyle.purposes,
              customWritingStyle.emotions,
              customWritingStyle.vocabularies,
              customWritingStyle.sentence_structures,
              customWritingStyle.perspectives,
              customWritingStyle.writing_structures,
              customWritingStyle.instructional_elements,
            ].flat()) : [];

            return (
              <>
                <Form.Item
                  name="writing_style_id"
                  validateTrigger="onBlur" rules={[{ required: true, type: "number", message: "Select a writing style" }]}

                  style={{ marginBottom: 12 }}
                >
                  <Select
                    placeholder="Select a writing style"
                    options={writingStyles?.data?.map(i => ({
                      value: i.id,
                      label: i.name,
                    }))}
                    maxTagCount="responsive"
                    maxLength={5}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Button type="text" block icon={<PlusOutlined />} onClick={() => setIsWritingStyleModalOpened(true)}>
                          New writing style
                        </Button>
                      </>
                    )}
                  />
                </Form.Item>

                {fieldCustomWritingId && characteristics.map((item, index) => {
                  return (
                    <Tag key={`${item}-${index}`} style={{ marginBottom: 3 }}>{item}</Tag>
                  )
                })}
              </>
            )
          }

          return (
            <>
              <Form.Item name="tones" label={<Label name="Tones" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} >
                <MultiSelectTagList
                  field="tones"
                  options={tones}
                  selectedOptions={fieldTones}
                  onAddTag={onAddTag}
                />
              </Form.Item>
              <Form.Item name="purposes" label={<Label name="Purposes" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} >
                <MultiSelectTagList
                  field="purposes"
                  options={purposes}
                  selectedOptions={fieldPurposes}
                  onAddTag={onAddTag}
                />
              </Form.Item>
              <Form.Item name="emotions" label={<Label name="Emotions" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} >
                <MultiSelectTagList
                  field="emotions"
                  options={emotions}
                  selectedOptions={fieldEmotions}
                  onAddTag={onAddTag}
                />
              </Form.Item>
              <Form.Item name="vocabularies" label={<Label name="Vocabularies" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} >
                <MultiSelectTagList
                  field="vocabularies"
                  options={vocabularies}
                  selectedOptions={fieldVocabularies}
                  onAddTag={onAddTag}
                />
              </Form.Item>
              <Form.Item name="sentence_structures" label={<Label name="Sentence sturctures" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} >
                <MultiSelectTagList
                  field="sentence_structures"
                  options={sentenceStructures}
                  selectedOptions={fieldSentenceStructures}
                  onAddTag={onAddTag}
                />
              </Form.Item>
              <Form.Item name="perspectives" label={<Label name="Perspectives" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} >
                <MultiSelectTagList
                  field="perspectives"
                  options={perspectives}
                  selectedOptions={fieldPerspectives}
                  onAddTag={onAddTag}
                />
              </Form.Item>
              <Form.Item name="writing_structures" label={<Label name="Writing structures" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} >
                <MultiSelectTagList
                  field="writing_structures"
                  options={writingStructures}
                  selectedOptions={fieldWritingStructures}
                  onAddTag={onAddTag}
                />
              </Form.Item>
              <Form.Item name="instructional_elements" label={<Label name="Instructional elements" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} >
                <MultiSelectTagList
                  field="instructional_elements"
                  options={instructionalElements}
                  selectedOptions={fieldInstructionalElements}
                  onAddTag={onAddTag}
                />
              </Form.Item>

              <Form.Item noStyle>
                <Flex justify="end">
                  <Button
                    type="default"
                    disabled={isEmpty([
                      fieldTones,
                      fieldPurposes,
                      fieldEmotions,
                      fieldVocabularies,
                      fieldSentenceStructures,
                      fieldPerspectives,
                      fieldWritingStructures,
                      fieldInstructionalElements,
                    ].flat())}
                    onClick={() => setIsWritingStyleModalOpened(true)}
                  >
                    Save writing style
                  </Button>
                </Flex>
              </Form.Item>
            </>
          )
        }}
      </Form.Item>
    </>
  )
}


export default WritingStyleSelect