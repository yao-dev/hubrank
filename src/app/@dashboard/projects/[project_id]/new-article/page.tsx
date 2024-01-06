'use client';
import { contentTypes, purposes, tones } from "@/options";
import { IconCircleMinus } from "@tabler/icons-react";
import { Button, Drawer, Flex, Form, Input, Segmented, Select, Switch } from "antd";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewArticleDrawer = ({ open, onClose }: Props) => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log(values);
  };

  return (
    <Drawer
      title="New article"
      width={600}
      onClose={onClose}
      open={open}
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
          <Button onClick={() => form.submit()} type="primary">
            Write article
          </Button>
        </Flex>
      }
    >
      <Form
        form={form}
        name="article"
        initialValues={{
          topic_cluster: [],
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
        <Form.Item name="seed_keyword" label="Seed Keyword" help="" rules={[{ required: true, type: "string", max: 30, message: "Type a seed keyword" }]} hasFeedback>
          <Input placeholder="Seed" />
        </Form.Item>

        <Form.Item name="title" label="Title" help="Leave blank to let the AI write the title" rules={[{ type: "string", max: 50 }]} hasFeedback>
          <Input placeholder="Title" count={{ show: true, max: 50 }} />
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

        <Form.Item name="clickbait" rules={[]} hasFeedback>
          <Flex gap="small">
            <Switch />
            <span>Clickbait</span>
          </Flex>
        </Form.Item>

        <Flex vertical gap="small" style={{ marginBottom: 24 }}>
          <Form.Item
            name="words_count"
            label="Words count"
            rules={[]}
            hasFeedback
            help="The written article will contain more or less the amount of words you choose"
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
            rules={[{ required: false, message: 'Please enter a valid url', type: "url" }]}
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
                        validateTrigger={['onChange', 'onBlur']}
                        rules={[{ required: false, message: 'Please enter a valid url', type: "url" }]}
                        noStyle
                        hasFeedback
                      >
                        <Input placeholder="Url" />
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'objective']}
                        validateTrigger={['onChange', 'onBlur']}
                        noStyle
                        hasFeedback
                      >
                        <Input placeholder="Objective" />
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
                    help='Select "Auto" to let the AI decide where it makes sense to include images in the content'
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