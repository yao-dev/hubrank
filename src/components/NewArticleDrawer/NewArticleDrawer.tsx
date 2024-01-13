'use client';;
import { getUserId } from "@/helpers/user";
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import useWritingStyles from "@/hooks/useWritingStyles";
import { contentTypes, purposes, tones } from "@/options";
import {
  StarOutlined
} from '@ant-design/icons';
import { App, Button, Drawer, Flex, Form, Input, Segmented, Select, Switch } from "antd";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  selectedKeyword?: string;
}

const NewArticleDrawer = ({ open, onClose, selectedKeyword }: Props) => {
  const { message, notification } = App.useApp();
  const [form] = Form.useForm();
  const projectId = useProjectId();
  const { data: project, isLoading } = useProjects().getOne(projectId)
  const [submitLoading, setSubmitLoading] = useState(false);
  const { data: writingStyles } = useWritingStyles().getAll();

  const keywords = useMemo(() => {
    if (!project || !project?.keywords?.length) return [];

    return project.keywords.map((item: any) => {
      return {
        cpc: item?.keyword_data?.keyword_info.cpc || "N/A",
        keyword: item?.keyword_data?.keyword || "N/A",
        value: item?.keyword_data?.keyword || "N/A",
        competition: item?.keyword_data?.keyword_info.competition || "N/A",
        search_volume: item?.keyword_data?.keyword_info.search_volume || "N/A",
      }
    })
  }, [project]);

  useEffect(() => {
    form.setFieldValue("seed_keyword", selectedKeyword ? selectedKeyword : [])
  }, [selectedKeyword])

  useEffect(() => {
    if (!!writingStyles?.data && writingStyles.data.length > 0) {
      form.setFieldValue("writing_style_id", writingStyles.data.find((i) => !!i.default).id)
    }
  }, [writingStyles])

  const onFinish = async (values: any) => {
    try {
      setSubmitLoading(true);
      let title = "";

      if (values.title_mode === "Custom") {
        title = values.custom_title;
      }
      if (values.title_mode === "Inspo") {
        title = values.inspo_title;
      }

      const { data } = await axios.post("/api/queue", {
        ...values,
        title,
        writing_style_id: values.writing_style_id ? +values.writing_style_id : null,
        user_id: await getUserId(),
        project_id: projectId
      });

      if (data?.error) {
        throw new Error("");
      }

      onClose()
      message.success('Article added in the queue!');
    } catch (e) {
      notification.error({
        message: "We had an issue adding your article in the queue please try again",
        placement: "bottomRight",
        role: "alert",
        duration: 5,
      })
    } finally {
      setSubmitLoading(false)
    }
  };

  if (isLoading) return null

  return (
    <Drawer
      title="New article"
      width={600}
      onClose={() => {
        onClose();
        form.resetFields()
      }}
      open={open}
      closable={!submitLoading}
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      // extra={
      //   <Space>
      //     <Button onClick={onClose}>Cancel</Button>
      //     <Button onClick={() => form.submit()} type="primary">
      //       Write article
      //     </Button>
      //   </Space>
      // }
      footer={
        <Flex justify="end" align="center" gap="middle">
          <Button disabled={submitLoading} onClick={onClose}>Cancel</Button>
          <Button onClick={() => form.submit()} type="primary" loading={submitLoading}>
            Write article
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        name="article"
        disabled={submitLoading}
        initialValues={{
          seed_keyword: "",
          title_mode: "Custom",
          custom_title: "",
          inspo_title: "",
          content_type: "",
          purpose: "",
          writing_mode: "Custom",
          writing_style_id: null,
          tones: [],
          clickbait: false,
          perspective: "",
          words_count: 1500,
          additional_information: "",
          sitemap: "",
          external_sources: "",
          external_sources_objective: "",
          with_featured_image: true,
          with_table_of_content: false,
          with_introduction: true,
          with_conclusion: true,
          with_key_takeways: false,
          with_faq: false,
          with_sections_image: false,
          with_sections_image_mode: 'Auto',
          image_source: 'Unsplash',
          with_seo: true,
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item name="seed_keyword" label="Main Keyword" help="Type your main keyword" rules={[{ required: true, type: "string", max: 75, message: "Add a main keyword" }]} hasFeedback>
          <Input placeholder="Main keyword" count={{ show: true, max: 75 }} />
        </Form.Item>

        <Form.Item
          name="title_mode"
          label="Title mode"
          rules={[{ required: true }]}
          style={{ marginTop: 42 }}
        >
          <Segmented defaultValue={"Custom"} options={["Custom", "Inspo", "AI"]} style={{ width: "fit-content" }} />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.title_mode !== currentValues.title_mode}
        >
          {({ getFieldValue }) => {
            if (getFieldValue('title_mode') === "Custom") {
              return (
                <Form.Item name="custom_title" label="Custom title" rules={[{ required: true, type: "string", max: 75 }]} hasFeedback>
                  <Input placeholder="Custom title" count={{ show: true, max: 75 }} />
                </Form.Item>
              )
            }

            if (getFieldValue('title_mode') === "Inspo") {
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

            if (getFieldValue('title_mode') === "AI") {
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
          <Segmented defaultValue={"custom"} options={["custom", "tones"]} style={{ width: "fit-content" }} />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.writing_mode !== currentValues.writing_mode}
        >
          {({ getFieldValue }) => {
            return getFieldValue('writing_mode') === "custom" ? (
              <Form.Item name="writing_style_id" validateTrigger="onBlur" rules={[{ required: true, type: "string", message: "Select a writing style" }]} hasFeedback>
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
          rules={[{ required: true }]}
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
            name="words_count"
            label="Words count"
            rules={[]}
            hasFeedback
            help="More or less the amount of words the article will contains"
          >
            <Segmented defaultValue={1500} options={[750, 1500, 2500, 3500]} style={{ width: "fit-content" }} />
          </Form.Item>

          <Form.Item
            name="additional_information"
            label="Additional information"
            rules={[{ type: "string", max: 150 }]}
            help="Provide any context or information we should consider while writing your article"
            hasFeedback
          >
            <Input.TextArea
              placeholder="Additional information"
              autoSize={{ minRows: 3, maxRows: 5 }}
              count={{
                show: true,
                max: 150,
              }}
            />
          </Form.Item>

          <Form.Item
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

        <Flex vertical>
          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_featured_image" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>Featured image</span>
          </Flex>

          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_table_of_content" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>Table of content</span>
          </Flex>

          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_introduction" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>Introduction</span>
          </Flex>

          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_conclusion" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>Conclusion</span>
          </Flex>

          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_key_takeways" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>Key takeways</span>
          </Flex>

          <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
            <Form.Item name="with_faq" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>FAQ</span>
          </Flex>

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
                  <Form.Item
                    name="with_sections_image_mode"
                    label="Sections with image" rules={[]}
                    tooltip='Select "Auto" to let the AI decide where it makes sense to include images in the content'
                  >
                    <Segmented defaultValue="Auto" options={['Auto', 'All sections (h2)']} style={{ width: "fit-content" }} />
                  </Form.Item>

                  <Form.Item name="image_source" label="Image source" rules={[]}>
                    <Segmented options={['Unsplash', 'Pexels', { label: 'iStock Photo', value: "istock", icon: <StarOutlined twoToneColor="#ffec3d" /> }]} style={{ width: "fit-content" }} />
                  </Form.Item>
                </>
              ) : null

            }}
          </Form.Item>

          <Flex gap="small" align="center">
            <Form.Item name="with_seo" rules={[]} style={{ margin: 0 }}>
              <Switch />
            </Form.Item>
            <span>SEO tags & Schema markups</span>
          </Flex>
        </Flex>
      </Form>
    </Drawer >
  )
}

export default NewArticleDrawer