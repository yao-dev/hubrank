'use client';;
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import {
  Flex,
  Form,
  FormInstance,
  Input,
  Radio,
  RadioChangeEvent,
  Segmented,
  Select,
  Switch,
  message,
} from "antd";
import { useEffect, useState } from "react";
import useDrawers from "@/hooks/useDrawers";
import useWritingStyles from "@/hooks/useWritingStyles";
import useLanguages from "@/hooks/useLanguages";
import WritingStyleForm from "../WritingStyleForm/WritingStyleForm";
import Label from "../Label/Label";
import { captionLengthOptions, platformsOptions } from "@/options";
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import WritingStyleSelect from "../WritingStyleSelect/WritingStyleSelect";
import { capitalize } from "lodash";
import ExternalSourcesField from "../ExternalSourcesField/ExternalSourcesField";

type Props = {
  onSubmit: (values: any) => void;
  form: FormInstance<any>
}

const NewCaptionForm = ({ onSubmit, form }: Props) => {
  const projectId = useProjectId();
  const { data: project, isPending } = useProjects().getOne(projectId)
  const { data: writingStyles } = useWritingStyles().getAll();
  const { data: languages } = useLanguages().getAll();
  const [, contextHolder] = message.useMessage();
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const drawers = useDrawers();
  const goal = Form.useWatch('goal', form);
  const withCta = Form.useWatch('with_cta', form);

  useEffect(() => {
    if (project && drawers.caption.isOpen) {
      form.setFieldValue("language_id", drawers.caption.languageId || project.language_id)
    }
  }, [project, drawers.caption.isOpen]);

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
          caption_length: captionLengthOptions[2].value, // normal = 150 characters
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
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onSubmit}
        onError={console.log}
      >
        <Form.Item
          name="language_id"
          label={<Label name="Language" />}
          rules={[{
            required: true,
            type: "number",
            message: "Select a language"
          }]}
          hasFeedback
        >
          <LanguageSelect languages={languages} />
        </Form.Item>

        <Form.Item
          name="platform"
          label={<Label name="Platform" />}
          rules={[{
            required: true,
            type: "string",
            message: "Select a platform"
          }]}
          hasFeedback
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
        </Form.Item>

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
            rules={[{ type: "string", max: 150, required: true }]}
            hasFeedback
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
            rules={[{ type: "string", max: 500 }]}
            hasFeedback
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
            name="youtube_url"
            validateTrigger={['onChange', 'onBlur']}
            rules={[{ required: true, message: 'Please enter a valid url', type: "url" }]}
            hasFeedback
          >
            <Input placeholder="Youtube URL" />
          </Form.Item>
        )}

        <Form.Item
          name="caption_length"
          label={<Label name="Caption length" />}
          rules={[{ required: true, type: "number" }]}
          hasFeedback
        >
          <Segmented
            options={captionLengthOptions}
            style={{ width: "fit-content" }}
          />
        </Form.Item>

        <Flex gap="small" align="center">
          <Form.Item name="with_hook" style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Add hook</span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_question" style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Engage with a question</span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_hashtags" style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Hashtags</span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_single_emoji" style={{ margin: 0 }}>
            <Switch size="small" onChange={(checked) => checked && form.setFieldValue("with_emojis", false)} />
          </Form.Item>
          <span>Single emoji</span>
        </Flex>

        <Flex gap="small" align="center">
          <Form.Item name="with_emojis" style={{ margin: 0 }}>
            <Switch size="small" onChange={(checked) => checked && form.setFieldValue("with_single_emoji", false)} />
          </Form.Item>
          <span>Emojis</span>
        </Flex>

        <Flex gap="small" align="center" style={{ marginBottom: 18 }}>
          <Form.Item name="with_cta" style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Add CTA</span>
        </Flex>

        {withCta && (
          <Form.Item name="cta" label="CTA" rules={[{ required: true, type: "string", max: 150 }]} hasFeedback>
            <Input placeholder="CTA" count={{ show: true, max: 150 }} />
          </Form.Item>
        )}

        <WritingStyleSelect form={form} />

        <ExternalSourcesField name="external_sources" />
      </Form>
    </Flex>
  )
}

export default NewCaptionForm