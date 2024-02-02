'use client';;
import useLanguages from "@/hooks/useLanguages";
import useProjectId from "@/hooks/useProjectId";
import useWritingStyles from "@/hooks/useWritingStyles";
import { contentTypes, purposes, tones } from "@/options";
import {
  StarOutlined
} from '@ant-design/icons';
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Flex,
  Form,
  Image,
  Input,
  Segmented,
  Select,
  Space,
  Switch,
  message,
} from "antd";
import axios from "axios";
import { uniqueId } from "lodash";
import { useEffect } from "react";

const SettingsForm = ({
  form,
  setLockedStep,
  submittingStep,
  setCurrentStep,
  isLocked,
  setHeadlines,
  setSubmittingStep,
  lockedStep,
  setRelatedKeywords
}) => {
  const { data: writingStyles } = useWritingStyles().getAll();
  const { data: languages } = useLanguages().getAll();
  const projectId = useProjectId();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const settingsForm = document.getElementById("settings-form");
    settingsForm.addEventListener('submit', (e) => e.preventDefault());
  }, [])

  const getHeadlines = useMutation({
    mutationFn: async (data: any) => {
      return axios.post("/api/headline-ideas", data)
    },
    // onSuccess: () => {},
    // onError: () => {
    //   notification.error({ message: "We couldn't save your change" })
    // }
  });

  const onFinish = async (values: any) => {
    const isCustomTitle = values.title_mode === "custom"

    if (isLocked) {
      setCurrentStep(isCustomTitle ? 2 : 1)
    }

    if (isCustomTitle) {
      setLockedStep(0);
      return setCurrentStep(2);
    }

    try {
      messageApi.open({
        type: 'loading',
        content: 'Getting headline ideas...',
        duration: 0,
      });

      setSubmittingStep(0)
      const { data } = await getHeadlines.mutateAsync({
        ...values,
        project_id: projectId,
        purpose: values.purpose.replaceAll("_", " "),
        tone: values.tones?.join?.(","),
        contentType: values.content_type.replaceAll("_", " "),
        clickbait: !!values.clickbait
      })

      setRelatedKeywords(data.keywords);

      setSubmittingStep(undefined);
      setCurrentStep(1)
      setLockedStep(0);

      setHeadlines(data.headlines.map((h) => ({
        id: uniqueId(h),
        headline: h[0] === "-" ? h.slice(1).trim() : h.trim()
      })));
    } catch (e) {
      console.error(e)
      setSubmittingStep(undefined);
    } finally {
      messageApi.destroy();
    }
  };

  return (
    <>
      {contextHolder}
      <Form
        form={form}
        name="settings-form"
        disabled={submittingStep !== undefined || isLocked}
        initialValues={{
          seed_keyword: "",
          title_mode: "ai",
          custom_title: "",
          inspo_title: "",
          content_type: "",
          purpose: "",
          writing_mode: "tones",
          writing_style_id: null,
          tones: [],
          clickbait: false,
          perspective: "first_person_singular",
          word_count: 1500,
          additional_information: "",
          sitemap: "",
          external_sources: "",
          external_sources_objective: "",
          with_featured_image: true,
          with_table_of_content: false,
          // with_introduction: true,
          // with_conclusion: true,
          // with_key_takeways: false,
          // with_faq: false,
          with_sections_image: false,
          with_sections_image_mode: 'Auto',
          image_source: 'Unsplash',
          with_seo: true,
          language_id: null,
          with_hook: false,
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onSubmitCapture={e => e.preventDefault()}
      >
        <Form.Item
          name="language_id"
          label="Language"
          rules={[{
            required: true,
            type: "number",
            message: "Select a language"
          }]}
          hasFeedback
        >
          <Select
            placeholder="Language"
            optionLabelProp="label"
            options={languages?.map((p) => {
              return {
                ...p,
                label: p.label,
                value: p.id
              }
            })}
            optionRender={(option: any) => {
              return (
                <Space>
                  <Image
                    src={option.data.image}
                    width={25}
                    height={25}
                    preview={false}
                  />
                  {option.label}
                </Space>
              )
            }}
          />
        </Form.Item>

        <Form.Item name="seed_keyword" label="Main Keyword" rules={[{ required: true, type: "string", max: 75, message: "Add a main keyword" }]} hasFeedback>
          <Input placeholder="Main keyword" count={{ show: true, max: 75 }} />
        </Form.Item>

        <Form.Item
          name="title_mode"
          label="Title mode"
          rules={[{ required: true }]}
        >
          <Segmented options={[{ label: "AI", value: "ai" }, { label: "Inspo", value: "inspo" }, { label: "Custom", value: "custom" }]} style={{ width: "fit-content" }} />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.title_mode !== currentValues.title_mode}
        >
          {({ getFieldValue }) => {
            if (getFieldValue('title_mode') === "custom") {
              return (
                <Form.Item name="custom_title" label="Custom title" rules={[{ required: true, type: "string", max: 75 }]} hasFeedback>
                  <Input placeholder="Custom title" count={{ show: true, max: 75 }} />
                </Form.Item>
              )
            }

            if (getFieldValue('title_mode') === "inspo") {
              return (
                <>
                  <Form.Item name="inspo_title" label="Inspo title" help="" rules={[{ required: true, type: "string", max: 75 }]} hasFeedback>
                    <Input placeholder="Inspo title" count={{ show: true, max: 75 }} />
                  </Form.Item>
                  <Flex gap="small" align="center" style={{ marginBottom: 24 }}>
                    <Form.Item name="clickbait" rules={[]} style={{ margin: 0 }}>
                      <Switch />
                    </Form.Item>
                    <span>Clickbait title</span>
                  </Flex>
                </>
              )
            }

            if (getFieldValue('title_mode') === "ai") {
              return (
                <Flex gap="small" align="center" style={{ marginBottom: 24 }}>
                  <Form.Item name="clickbait" rules={[]} style={{ margin: 0 }}>
                    <Switch />
                  </Form.Item>
                  <span>Clickbait title</span>
                </Flex>
              )
            }
          }}
        </Form.Item>

        <Form.Item name="content_type" label="Content type" rules={[{ required: true, type: "string", message: "Select a content type" }]} hasFeedback>
          <Select
            showSearch
            placeholder="Select a content type"
            options={contentTypes}
          />
        </Form.Item>

        <Form.Item name="purpose" label="Purpose" rules={[{ required: true, type: "string", message: "Select a purpose" }]} hasFeedback>
          <Select
            showSearch
            placeholder="Select a purpose"
            options={purposes}
          />
        </Form.Item>

        <Form.Item
          name="writing_mode"
          label="Writing style"
          rules={[{ required: true }]}
        >
          <Segmented options={[{ label: "Tones", value: "tones" }, { label: "Custom", value: "custom" }]} style={{ width: "fit-content" }} />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.writing_mode !== currentValues.writing_mode}
        >
          {({ getFieldValue }) => {
            return getFieldValue('writing_mode') === "custom" ? (
              <Form.Item name="writing_style_id" validateTrigger="onBlur" rules={[{ required: true, type: "number", message: "Select a writing style" }]} hasFeedback>
                <Select
                  placeholder="Select a writing style"
                  options={writingStyles?.data?.map(i => ({
                    value: i.id,
                    label: i.name,
                  }))}
                  maxTagCount="responsive"
                  maxLength={5}
                />
              </Form.Item>

            ) : (
              <Form.Item name="tones" validateTrigger="onBlur" rules={[{ required: true, type: "array", message: "Select at least a tone" }]} hasFeedback>
                <Select
                  showSearch
                  mode="multiple"
                  allowClear
                  placeholder="Select at least a tone"
                  options={tones}
                  maxTagCount="responsive"
                  maxLength={5}
                />
              </Form.Item>
            )
          }}
        </Form.Item>

        <Form.Item
          name="perspective"
          label="Perspective"
          rules={[{ required: true, message: "Select a perspective" }]}
          hasFeedback
        >
          <Segmented
            options={[
              {
                label: "1st person singular",
                value: "first_person_singular"
              },
              {
                label: "1st person plural",
                value: "first_person_plural"
              },
              {
                label: "2nd person",
                value: "second_person"
              },
              {
                label: "3rd person",
                value: "third_person"
              },
            ]}
            style={{ width: "fit-content" }}
          />
        </Form.Item>

        <Flex vertical gap="small" style={{ marginBottom: 24 }}>
          <Form.Item
            name="word_count"
            label="Words count"
            rules={[]}
            hasFeedback
            help="More or less the amount of words the article will contains"
          >
            <Segmented options={[750, 1500, 2500, 3500]} style={{ width: "fit-content" }} />
          </Form.Item>

          <Form.Item
            name="additional_information"
            label="Additional information"
            rules={[{ type: "string", max: 150 }]}
            hasFeedback
          >
            <Input.TextArea
              placeholder="Provide any context or information we should consider while writing your article"
              autoSize={{ minRows: 3, maxRows: 5 }}
              count={{
                show: true,
                max: 150,
              }}
            />
          </Form.Item>

          <Form.Item
            hidden
            name="sitemap"
            label="Sitemap"
            rules={[{
              required: false,
              type: "url",
              message: "Enter a valid url",
              transform: (url: any) => {
                if (!url?.startsWith('https://')) {
                  url = `https://${url}`
                }
                return new URL(url).origin
              }
            }]}
            help="We'll use this sitemap to include internal links in the article"
            hasFeedback
          >
            <Input placeholder="Sitemap url" />
          </Form.Item>

          <Form.Item
            hidden
            name="external_sources"
            label="External source"
            rules={[{ type: "string" }]}
            help="Add a source to help the AI write content with real time data that it might not have knowledge of (invalid links will be ignored)"
          >
            <Input.TextArea
              placeholder={`reddit.com\nquora.com`}
              autoSize={{ minRows: 3, maxRows: 5 }}
            // count={{
            //   show: true,
            //   max: 150,
            // }}
            />
          </Form.Item>

          <Form.Item
            hidden
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.external_sources !== currentValues.external_sources}
          >
            {({ getFieldValue }) => {
              return getFieldValue('external_sources')?.length > 3 ? (
                <Form.Item
                  name="external_sources_objective"
                  label="External sources objective"
                  rules={[{ required: true, type: "string", max: 500 }]}
                  help="Simply describe what you want to do with the content we scrape"
                  hasFeedback
                >
                  <Input.TextArea
                    placeholder="Type here"
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    count={{
                      show: true,
                      max: 150,
                    }}
                  />
                </Form.Item>
              ) : null

            }}
          </Form.Item>
        </Flex>



        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="with_hook" tooltip="Short sentence that comes before the introduction, its goal is to capture the reader's attention and encourage them to continue reading." rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Hook</span>
        </Flex>

        <Flex vertical>
          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_featured_image" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>Featured image</span>
          </Flex>

          {/* <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="with_table_of_content" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Table of content</span>
        </Flex> */}

          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_sections_image" style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>Include sections image</span>
          </Flex>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.with_sections_image !== currentValues.with_sections_image}
          >
            {({ getFieldValue }) => {
              return !!getFieldValue('with_sections_image') ? (
                <>
                  {/* <Form.Item
                  name="with_sections_image_mode"
                  label="Sections with image" rules={[]}
                  tooltip='Select "Auto" to let the AI decide where it makes sense to include images in the content'
                >
                  <Segmented defaultValue="Auto" options={['Auto', 'All sections (h2)']} style={{ width: "fit-content" }} />
                </Form.Item> */}

                  <Form.Item name="image_source" rules={[]}>
                    <Segmented options={['Unsplash', 'Pexels', { label: 'iStock Photo', value: "istock", icon: <StarOutlined twoToneColor="#ffec3d" /> }]} style={{ width: "fit-content" }} />
                  </Form.Item>
                </>
              ) : null

            }}
          </Form.Item>

          {/* <Flex gap="small" align="center">
          <Form.Item name="with_seo" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>SEO tags & Schema markups</span>
        </Flex> */}

          <Form.Item>
            <Flex justify="end" align="center" gap="middle">
              <Button disabled={submittingStep === 0 || lockedStep === 0} type="primary" onClick={() => form.submit()} loading={submittingStep === 0}>
                Next
              </Button>
            </Flex>
          </Form.Item>
        </Flex>
      </Form>
    </>
  )
}

export default SettingsForm;