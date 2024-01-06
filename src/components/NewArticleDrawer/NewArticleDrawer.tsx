'use client';
import { getUserId } from "@/helpers/user";
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import { contentTypes, purposes, tones } from "@/options";
import { IconCircleMinus } from "@tabler/icons-react";
import { App, Button, Drawer, Flex, Form, Input, Segmented, Select, Space, Switch } from "antd";
import axios from "axios";
import { useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewArticleDrawer = ({ open, onClose }: Props) => {
  const { message, notification } = App.useApp();
  const [form] = Form.useForm();
  const projectId = useProjectId();
  const { data: project, isLoading } = useProjects().getOne(projectId)
  const [submitLoading, setSubmitLoading] = useState(false);

  const keywords = useMemo(() => {
    if (!project) return [];

    return project.keywords?.result?.map((item: any) => {
      return {
        cpc: item.cpc || "N/A",
        keyword: item.keyword,
        value: item.keyword,
        competition: item.competition || "N/A",
        search_volume: item.search_volume || "N/A",
      }
    })
  }, [project])

  const onFinish = async (values: any) => {
    try {
      setSubmitLoading(true)
      const { data } = await axios.post("/api/article-queue", {
        ...values,
        user_id: await getUserId(),
        project_id: projectId
      });

      if (data?.error) {
        throw new Error("");
      }

      onClose()
      form.resetFields();
      message.success('Article added in the queue!');
    } catch (e) {
      console.error(e);
      notification.error({
        message: "We had an issue adding your article to the queue please try again",
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
      onClose={onClose}
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
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={() => form.submit()} type="primary" loading={submitLoading}>
            Write article
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        name="article"
        initialValues={{
          seed_keyword: [],
          write_own_title: false,
          title: "",
          content_type: "",
          purpose: "",
          tones: [],
          clickbait: false,
          words_count: 1500,
          additional_information: "",
          sitemap: "",
          external_sources: [
            {
              url: "",
              objective: "",
            }
          ],
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
        <Form.Item name="seed_keyword" label="Seed Keyword" help="Type or select one keyword" rules={[{ required: true, type: "array", len: 1, message: "Add a seed keyword" }]} hasFeedback>
          <Select
            mode="tags"
            showSearch
            placeholder="Seed keyword"
            allowClear
            optionLabelProp="keyword"
            options={keywords}
            optionRender={(option) => (
              <Space>
                <span><b>{option.data.keyword}</b> |</span>
                <span>competition: {option.data.competition} |</span>
                <span>volume: {option.data.search_volume}</span>
              </Space>
            )}
          />
        </Form.Item>

        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="write_own_title" style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Write my own title</span>
        </Flex>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.write_own_title !== currentValues.write_own_title}
        >
          {({ getFieldValue }) => {
            return !!getFieldValue('write_own_title') ? (
              <>
                <Form.Item name="title" label="Title" help="Leave blank to let the AI write the title" rules={[{ type: "string", max: 75 }]} hasFeedback>
                  <Input placeholder="Title" count={{ show: true, max: 75 }} />
                </Form.Item>
              </>
            ) : null

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

        <Form.Item name="tones" label="Tones" rules={[{ required: true, type: "array", message: "Select at least a tone" }]} hasFeedback>
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

        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item name="clickbait" rules={[]} style={{ margin: 0 }}>
            <Switch />
          </Form.Item>
          <span>Clickbait</span>
        </Flex>

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

          <Form.List name="external_sources">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    key={field.key}
                    label={index === 0 ? 'External sources' : ''}
                    tooltip={index === 0 ? "Add sources to help the AI write content with real time data that it might not have knowledge of (sources with empty objective will be ignored)" : ''}
                  >
                    <Flex align="center" gap="small">
                      <Form.Item
                        {...field}
                        name={[field.name, 'url']}
                        validateTrigger="onBlur"
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
                        noStyle
                        hasFeedback
                      >
                        <Input placeholder="Url" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'objective']}
                        validateTrigger="onBlur"
                        rules={[{ required: false, message: 'Add an objective to the url', type: "string", max: 75 }]}
                        noStyle
                        hasFeedback
                      >
                        <Input placeholder="Objective" count={{ show: true, max: 75 }} />
                      </Form.Item>

                      {fields.length > 1 ? (
                        <IconCircleMinus size={24} onClick={() => remove(field.name)} style={{ cursor: 'pointer' }} />
                      ) : null}

                    </Flex>
                  </Form.Item>
                ))}
                {fields.length < 3 && (
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block>
                      + Add url
                    </Button>
                  </Form.Item>
                )}
              </>
            )}
          </Form.List>
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
                    <Segmented options={['Unsplash', 'Pexels', 'AI']} style={{ width: "fit-content" }} />
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