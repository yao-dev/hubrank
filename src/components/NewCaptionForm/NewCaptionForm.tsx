'use client';;
import { Flex, Form, FormInstance, Input, InputNumber, Select, message } from "antd";
import { useState } from "react";
import WritingStyleForm from "../WritingStyleForm/WritingStyleForm";
import Label from "../Label/Label";
import { captionCallToActions, captionTypes } from "@/options";

type Props = {
  onSubmit: (values: any) => void;
  form: FormInstance<any>;
  isSubmitting: boolean;
}

const NewCaptionForm = ({ onSubmit, form, isSubmitting }: Props) => {
  const [, contextHolder] = message.useMessage();
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const type = Form.useWatch('type', form);

  return (
    <Flex vertical gap="large" style={{ height: "100%" }}>
      {contextHolder}
      <WritingStyleForm
        opened={isWritingStyleModalOpened}
        setModalOpen={setIsWritingStyleModalOpened}
      />
      <Form
        form={form}
        disabled={isSubmitting}
        initialValues={{
          source: "",
          type: "",
          keywords: "",
          cta: "",
          hashtags: "",
          additional_information: "",
          max_sentences: 1,
          max_paragraphs: 1,
          max_emojis: 0
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onSubmit}
        scrollToFirstError
      >
        <Form.Item
          name="keywords"
          label={<Label name="Keywords" />}
          rules={[{ type: "string", max: 50, required: true, message: "Add keywords" }]}

        >
          <Input
            placeholder="seo, marketing"
            allowClear
            count={{
              show: true,
              max: 50,
            }}
          />
        </Form.Item>

        <Form.Item
          name="type"
          label={<Label name="Type" />}
          rules={[{
            required: true,
            type: "string",
            message: "Select a type"
          }]}
        >
          <Select
            placeholder="Type"
            optionLabelProp="label"
            options={captionTypes?.map((item) => {
              return {
                label: item,
                value: item
              }
            })}
          />
        </Form.Item>

        <Form.Item
          name="source"
          label={<Label name="Source" />}
          rules={[{ type: "string", max: 1500, required: false, message: "Add source" }]}
          help="Add a post to comment, or rephrase, a X or Youtube url"
          className="mb-8"
        >
          <Input
            placeholder="Source"
            count={{
              show: false,
              max: 1500,
            }}
          />
        </Form.Item>

        <Form.Item
          name="cta"
          label={<Label name="Call to Action" />}
          rules={[{
            required: false,
            type: "string",
            message: "Select a type"
          }]}
        >
          <Select
            placeholder="Call to Action"
            optionLabelProp="label"
            allowClear
            options={captionCallToActions?.map((item) => {
              return {
                label: item,
                value: item
              }
            })}
          />
        </Form.Item>

        <Form.Item
          name="hashtags"
          label={<Label name="Hashtags" />}
          rules={[{ type: "string", max: 50, required: false }]}

        >
          <Input
            placeholder="#seo #marketing"
            count={{
              show: true,
              max: 50,
            }}
          />
        </Form.Item>

        <Form.Item
          name="additional_information"
          label={<Label name="Additional information" />}
          rules={[{ type: "string", max: 100, required: false, message: "Add prompt" }]}

        >
          <Input
            placeholder="Additional information"
            count={{
              show: true,
              max: 100,
            }}
          />
        </Form.Item>

        <div className="grid grid-cols-3">
          <Form.Item
            name="max_sentences"
            label={<Label name="Sentences" />}
            rules={[{ type: "number", max: 20, required: false }]}

          >
            <InputNumber min={1} max={20} />
          </Form.Item>

          {/* hide for comments */}
          {type !== "Comment" && (
            <Form.Item
              name="max_paragraphs"
              label={<Label name="Paragraphs" />}
              rules={[{ type: "number", max: 5, required: false }]}

            >
              <InputNumber min={0} max={5} />
            </Form.Item>
          )}

          <Form.Item
            name="max_emojis"
            label={<Label name="Emojis" />}
            rules={[{ type: "number", max: 5, required: false }]}

          >
            <InputNumber min={0} max={5} />
          </Form.Item>
        </div>
      </Form>
    </Flex>
  )
}

export default NewCaptionForm