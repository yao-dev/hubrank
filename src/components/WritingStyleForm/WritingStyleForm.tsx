import useProjectId from "@/hooks/useProjectId";
import useWritingStyles from "@/hooks/useWritingStyles";
import { App, Flex, Form, Input, Modal, Segmented, Switch } from "antd";
import { useEffect, useState } from "react";
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
import MultiSelectTagList from "../MultiSelectTagList/MultiSelectTagList";
import { isEmpty, omit } from "lodash";
import Label from "../Label/Label";
import axios from "axios";

const options = [
  {
    value: "text",
    label: "Text",
  },
  {
    value: "url",
    label: "Url",
  },
]

// type InitialValues = "tones" | "purposes"
//   | "emotions"
//   | "vocabularies"
//   | "sentence_structures"
//   | "perspectives"
//   | "writing_structures"
//   | "instructional_elements"

type Props = {
  opened: boolean;
  setModalOpen: (open: boolean) => void;
  initialValues?: {
    tones: string[];
    purposes: string[];
    emotions: string[];
    vocabularies: string[];
    sentence_structures: string[];
    perspectives: string[];
    writing_structures: string[];
    instructional_elements: string[];
  }
}

const WritingStyleForm = ({ opened, setModalOpen, initialValues }: Props) => {
  const projectId = useProjectId();
  const [form] = Form.useForm();
  const { create, getAll } = useWritingStyles()
  const { data: writingStyles } = getAll();
  const { message, notification } = App.useApp();
  const mode = Form.useWatch("mode", form);
  const fieldText = Form.useWatch("text", form);
  const fieldTones = Form.useWatch("tones", form);
  const fieldPurposes = Form.useWatch("purposes", form);
  const fieldEmotions = Form.useWatch("emotions", form);
  const fieldVocabularies = Form.useWatch("vocabularies", form);
  const fieldSentenceStructures = Form.useWatch("sentence_structures", form);
  const fieldPerspectives = Form.useWatch("perspectives", form);
  const fieldWritingStructures = Form.useWatch("writing_structures", form);
  const fieldInstructionalElements = Form.useWatch("instructional_elements", form);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!writingStyles?.count) {
      form.setFieldValue("default", true)
    }
  }, [writingStyles]);

  useEffect(() => {
    if (initialValues) {
      Object.keys(initialValues).forEach((key) => {
        form.setFieldValue(key, initialValues[key])
      })
    }
  }, [initialValues]);

  const onAddTag = (list: string[], tag: string, checked: boolean, field: string) => {
    const nextSelectedTags = checked
      ? [...list, tag]
      : list.filter((t) => t !== tag);
    form.setFieldValue(field, nextSelectedTags);
  }


  const onSubmit = async (values: any) => {
    try {
      let writingCharacteristics = {};
      setIsSaving(true)

      if (mode === "text") {
        const { data } = await axios.post('/api/get-writing-characteristics', { text: values.text })
        writingCharacteristics = data.writing_characteristics
      }
      await create.mutateAsync({
        ...omit(values, ['mode']),
        ...writingCharacteristics,
        project_id: projectId,
      })
      onClose()
      message.success('Writing style created!');
    } catch {
      notification.error({
        message: "We had an issue creating a new writing style please try again",
        placement: "bottomRight",
        role: "alert",
        duration: 5,
      })
    } finally {
      setIsSaving(false);
    }
  }

  const onClose = () => {
    setModalOpen(false);
    form.resetFields();
  }

  return (
    <Modal
      title="Add writing style"
      open={opened}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={isSaving}
      okButtonProps={{
        disabled: mode === "manual" ? isEmpty([
          fieldTones,
          fieldPurposes,
          fieldEmotions,
          fieldVocabularies,
          fieldSentenceStructures,
          fieldPerspectives,
          fieldWritingStructures,
          fieldInstructionalElements,
        ].flat()) : !fieldText
      }}
    >
      <Flex vertical gap="large">
        <Form
          disabled={isSaving}
          form={form}
          initialValues={{
            name: "",
            mode: initialValues ? "manual" : "text",
            text: "",
            default: false,
            tones: [],
            purposes: [],
            emotions: [],
            vocabularies: [],
            sentence_structures: [],
            perspectives: [],
            writing_structures: [],
            instructional_elements: [],
          }}
          layout="vertical"
          onFinish={onSubmit}
        >
          <Form.Item
            name="name"
            label={<Label name="Name" />}
            rules={[{
              required: true,
              type: "string",
              message: "Enter a name",
            }]}
            hasFeedback
          >
            <Input placeholder="Name" />
          </Form.Item>

          <Form.Item name="mode">
            <Segmented options={[{ label: "From text", value: "text" }, { label: "Manual", value: "manual" }]} style={{ width: "fit-content" }} />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.title_mode !== currentValues.title_mode}
          >
            {() => {
              if (mode === "manual") {
                return (
                  <>
                    <Form.Item name="tones" label={<Label name="Tones" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                      <MultiSelectTagList
                        field="tones"
                        options={tones}
                        selectedOptions={fieldTones}
                        onAddTag={onAddTag}
                      />
                    </Form.Item>
                    <Form.Item name="purposes" label={<Label name="Purposes" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                      <MultiSelectTagList
                        field="purposes"
                        options={purposes}
                        selectedOptions={fieldPurposes}
                        onAddTag={onAddTag}
                      />
                    </Form.Item>
                    <Form.Item name="emotions" label={<Label name="Emotions" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                      <MultiSelectTagList
                        field="emotions"
                        options={emotions}
                        selectedOptions={fieldEmotions}
                        onAddTag={onAddTag}
                      />
                    </Form.Item>
                    <Form.Item name="vocabularies" label={<Label name="Vocabularies" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                      <MultiSelectTagList
                        field="vocabularies"
                        options={vocabularies}
                        selectedOptions={fieldVocabularies}
                        onAddTag={onAddTag}
                      />
                    </Form.Item>
                    <Form.Item name="sentence_structures" label={<Label name="Sentence sturctures" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                      <MultiSelectTagList
                        field="sentence_structures"
                        options={sentenceStructures}
                        selectedOptions={fieldSentenceStructures}
                        onAddTag={onAddTag}
                      />
                    </Form.Item>
                    <Form.Item name="perspectives" label={<Label name="Perspectives" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                      <MultiSelectTagList
                        field="perspectives"
                        options={perspectives}
                        selectedOptions={fieldPerspectives}
                        onAddTag={onAddTag}
                      />
                    </Form.Item>
                    <Form.Item name="writing_structures" label={<Label name="Writing structures" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                      <MultiSelectTagList
                        field="writing_structures"
                        options={writingStructures}
                        selectedOptions={fieldWritingStructures}
                        onAddTag={onAddTag}
                      />
                    </Form.Item>
                    <Form.Item name="instructional_elements" label={<Label name="Instructional elements" />} validateTrigger="onBlur" rules={[{ type: "array", message: "Select at least a tone" }]} hasFeedback>
                      <MultiSelectTagList
                        field="instructional_elements"
                        options={instructionalElements}
                        selectedOptions={fieldInstructionalElements}
                        onAddTag={onAddTag}
                      />
                    </Form.Item>
                  </>
                )
              }

              return (
                <Flex vertical gap="small">
                  <Form.Item
                    name="text"
                    rules={[{ required: true, message: 'Please enter a text', type: "string", max: 750 }]}
                    hasFeedback
                    help="Create your own writing style based on a custom text."
                  >
                    <Input.TextArea
                      placeholder="Type anything"
                      count={{ show: true, max: 750 }}
                      autoSize={{ minRows: 5, maxRows: 8 }}
                    />
                  </Form.Item>
                </Flex>
              )
            }}
          </Form.Item>

          <Form.Item name="default" style={{ marginTop: 12 }}>
            <Flex gap="small">
              <Switch />
              <span>Set as default</span>
            </Flex>
          </Form.Item>
        </Form>
      </Flex>
    </Modal>
  )
}

export default WritingStyleForm;