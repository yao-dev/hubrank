'use client';;
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import {
  Flex,
  Form,
  FormInstance,
  Input,
  InputNumber,
  Radio,
  RadioChangeEvent,
  Segmented,
  Select,
  Switch,
  message,
} from "antd";
import { useState } from "react";
import useWritingStyles from "@/hooks/useWritingStyles";
import WritingStyleForm from "../WritingStyleForm/WritingStyleForm";
import Label from "../Label/Label";
import { captionCallToActions, captionLengthOptions, captionTypes } from "@/options";
import WritingStyleSelect from "../WritingStyleSelect/WritingStyleSelect";
import { capitalize } from "lodash";

type Props = {
  onSubmit: (values: any) => void;
  form: FormInstance<any>;
  isSubmitting: boolean;
}

const _NewCaptionForm = ({ onSubmit, form, isSubmitting }: Props) => {
  const projectId = useProjectId();
  const { data: project, isPending } = useProjects().getOne(projectId)
  const { data: writingStyles } = useWritingStyles().getAll();
  // const { data: languages } = useLanguages().getAll();
  const [, contextHolder] = message.useMessage();
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const goal = Form.useWatch('goal', form);
  const withCta = Form.useWatch('with_cta', form);

  // useEffect(() => {
  //   if (project?.language_id) {
  //     form.setFieldValue("language_id", project.language_id)
  //   }
  // }, [project?.language_id]);

  if (isPending) return null;

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
          writing_mode: "custom",
          with_hashtags: false,
          with_emojis: false,
          writing_style_id: !!writingStyles?.data ? writingStyles.data.find((i) => !!i.default)?.id : null,
          tones: [],
          purposes: [],
          emotions: [],
          vocabularies: [],
          sentence_structures: [],
          perspectives: [],
          writing_structures: [],
          instructional_elements: [],
          // perspective: "first_person_singular", // TODO: remove it in favor of perspectives
          caption_length: captionLengthOptions[0].value, // normal = 150 characters
          description: "",
          language_id: null,
          caption_source: "",
          with_cta: false,
          goal: "write",
          with_hook: false,
          with_single_emoji: false,
          with_question: false,
          cta: "",
          external_sources: [],
          youtube_url: ""
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onSubmit}
        scrollToFirstError
      >
        {/* <Form.Item
          name="language_id"
          label={<Label name="Language" />}
          rules={[{
            required: true,
            type: "number",
            message: "Select a language"
          }]}

        >
          <LanguageSelect languages={languages} />
        </Form.Item> */}

        {/* <Form.Item
          name="platform"
          label={<Label name="Platform" />}
          rules={[{
            required: true,
            type: "string",
            message: "Select a platform"
          }]}
        >
          <Select
            placeholder="Platform"
            optionLabelProp="label"
            options={platformsOptions?.map((p) => {
              return {
                ...p,
                label: p.label,
                value: p.value
              }
            })}
          />
        </Form.Item> */}

        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item
            label={<Label name="What's your goal?" />}
            name="goal"
            rules={[{
              required: true,
              type: "string",
              message: "Select a goal"
            }]}
            style={{ margin: 0 }}
          >
            <Radio.Group
              onChange={(e: RadioChangeEvent) => {
                form.setFieldValue("goal", e.target.value)
              }}
            >
              <Radio value="write">Write</Radio>
              <Radio value="rephrase">Rephrase</Radio>
              <Radio value="reply">Reply</Radio>
              <Radio value="youtube_to_caption">Youtube to caption</Radio>
            </Radio.Group>
          </Form.Item>
        </Flex>


        {goal === "write" && (
          <Form.Item
            name="description"
            label={<Label name="What do you want to write about?" />}
            rules={[{ type: "string", max: 150, required: true, message: "Add a description" }]}

          >
            <Input.TextArea
              placeholder=""
              autoSize={{ minRows: 3, maxRows: 5 }}
              count={{
                show: true,
                max: 150,
              }}
            />
          </Form.Item>
        )}

        {["rephrase", "reply"].includes(goal) && (
          <Form.Item
            name="caption_source"
            label={<Label name={`${capitalize(goal)} caption`} />}
            rules={[{ required: true, type: "string", max: 500 }]}

          >
            <Input.TextArea
              placeholder={`Type the caption you want to ${goal}`}
              autoSize={{ minRows: 2, maxRows: 5 }}
              count={{
                show: true,
                max: 500,
              }}
            />
          </Form.Item>
        )}

        {goal === "youtube_to_caption" && (
          <Form.Item
            label={<Label name="Youtube url" />}
            name="youtube_url"
            validateTrigger={['onChange', 'onBlur']}
            rules={[{
              required: true,
              message: 'Please enter a valid Youtube url',
              type: "url"
            },
            () => ({
              validator(_, value) {
                if (!value || value.startsWith("https://www.youtube.com/watch?v=") || value.startsWith("https://youtu.be/")) {
                  return Promise.resolve();
                }
                return Promise.reject();
              },
            }),
            ]}

          >
            <Input placeholder="Youtube URL" />
          </Form.Item>
        )}

        <Form.Item
          name="caption_length"
          label={<Label name="Caption length" />}
          rules={[{ required: true, type: "number" }]}

        >
          <Segmented
            options={captionLengthOptions}
            style={{ width: "fit-content" }}
          />
        </Form.Item>

        <Flex gap="small" align="center">
          <Form.Item name="with_hashtags" style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span
            className="cursor-pointer"
            onClick={() => form.setFieldValue("with_hashtags", !form.getFieldValue("with_hashtags"))}
          >
            Hashtags
          </span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_single_emoji" style={{ margin: 0 }}>
            <Switch size="small" onChange={(checked) => checked && form.setFieldValue("with_emojis", false)} />
          </Form.Item>
          <span
            className="cursor-pointer"
            onClick={() => {
              form.setFieldValue("with_single_emoji", !form.getFieldValue("with_single_emoji"));
              if (form.getFieldValue("with_emojis")) {
                form.setFieldValue("with_emojis", false)
              }
            }}
          >
            Single emoji
          </span>
        </Flex>

        <Flex gap="small" align="center" style={{ marginBottom: goal !== "reply" ? 0 : 18 }}>
          <Form.Item name="with_emojis" style={{ margin: 0 }}>
            <Switch size="small" onChange={(checked) => checked && form.setFieldValue("with_single_emoji", false)} />
          </Form.Item>
          <span
            className="cursor-pointer"
            onClick={() => {
              form.setFieldValue("with_emojis", !form.getFieldValue("with_emojis"));
              if (form.getFieldValue("with_single_emoji")) {
                form.setFieldValue("with_single_emoji", false)
              }
            }}
          >
            Emojis
          </span>
        </Flex>

        {goal !== "reply" && (
          <>
            <Flex gap="small" align="center">
              <Form.Item name="with_hook" style={{ margin: 0 }}>
                <Switch size="small" />
              </Form.Item>
              <span
                className="cursor-pointer"
                onClick={() => form.setFieldValue("with_hook", !form.getFieldValue("with_hook"))}
              >
                Add hook
              </span>
            </Flex>

            <Flex gap="small" align="center">
              <Form.Item name="with_question" style={{ margin: 0 }}>
                <Switch size="small" />
              </Form.Item>
              <span
                className="cursor-pointer"
                onClick={() => form.setFieldValue("with_question", !form.getFieldValue("with_question"))}
              >
                Engage with a question
              </span>
            </Flex>
            <Flex gap="small" align="center" style={{ marginBottom: 18 }}>
              <Form.Item name="with_cta" style={{ margin: 0 }}>
                <Switch size="small" />
              </Form.Item>
              <span
                className="cursor-pointer"
                onClick={() => form.setFieldValue("with_cta", !form.getFieldValue("with_cta"))}
              >
                Add CTA
              </span>
            </Flex>
          </>
        )}

        {withCta && (
          <Form.Item name="cta" label="CTA" rules={[{ required: true, type: "string", max: 150 }]} >
            <Input placeholder="CTA" count={{ show: true, max: 150 }} />
          </Form.Item>
        )}

        <WritingStyleSelect form={form} />

        {/* <ExternalSourcesField name="external_sources" /> */}
      </Form>
    </Flex>
  )
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
          max_sentences: 3,
          max_paragraphs: 3,
          max_emojis: 2
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