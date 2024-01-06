import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import { Button, Form, Input, Select, Typography } from "antd";
import { useState } from "react";

const robotOptions = [
  // 'all',
  // 'noindex',
  // 'dofollow',
  'follow',
  // 'nofollow',
  // 'none',
  // 'noarchive',
  // 'nositelinkssearchbox',
  // 'nosnippet',
  // 'indexifembedded',
  'max-snippet:-1',
  'max-image-preview:large',
  'max-video-preview:-1',
  'notranslate',
  // 'noimageindex',
  'NOODP',
].map((i) => (
  { value: i, label: i }
))

const ProjectMetaForm = () => {
  const [checked, setChecked] = useState({
    title: true,
    description: true,
    keywords: true,
    author: true,
    google_site_verification: true,
    viewport: true,
    http_equiv_value: true,
    http_equiv_content: true,
    robots: true,
    link_canonical: true,
    itemprop_name: true,
    itemprop_description: true,
    itemprop_image: true,
    og_url: true,
    og_type: true,
    og_title: true,
    og_description: true,
    og_image: true,
    twitter_card: true,
    twitter_title: true,
    twitter_image: true,
    twitter_description: true,
    twitter_creator: true,
    twitter_site: true,
    twitter_app_id_iphone: true,
    twitter_app_name_iphone: true,
    twitter_app_url_iphone: true,
    twitter_app_id_googleplay: true,
    twitter_app_name_googleplay: true,
    twitter_app_url_googleplay: true,
  });
  const [form] = Form.useForm();
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId);

  if (!project) {
    return null;
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={() => { }}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 20 }}
      style={{ maxWidth: 600 }}
      initialValues={{
        html: '',
        title: project?.metatags?.title || "",
        description: project?.metatags?.description || "",
        keywords: project?.metatags?.keywords || "",
        author: project?.metatags?.author || "",
        google_site_verification: project?.metatags?.google_site_verification || "",
        viewport: project?.metatags?.viewport || "",
        http_equiv_value: project?.metatags?.http_equiv_value || "",
        http_equiv_content: project?.metatags?.http_equiv_content || "",
        robots: project?.metatags?.robots?.split(',') || [],
        // robots_all: false,
        // robots_noindex: false,
        // robots_nofollow: false,
        // robots_none: false,
        // robots_noarchive: false,
        // robots_nositelinkssearchbox: false,
        // robots_nosnippet: false,
        // robots_indexifembedded: false,
        // robots_max_snippet: 0,
        // robots_max_image_preview: 'none',
        // robots_max_video_preview: 0,
        // robots_notranslate: false,
        // robots_noimageindex: false,
        link_canonical: project?.metatags?.link_canonical || '',
        itemprop_name: project?.metatags?.itemprop_name || '',
        itemprop_description: project?.metatags?.itemprop_description || '',
        itemprop_image: project?.metatags?.itemprop_image || '',
        og_url: project?.metatags?.og_url || '',
        og_type: project?.metatags?.og_type || '',
        og_title: project?.metatags?.og_title || '',
        og_description: project?.metatags?.og_description || '',
        og_image: project?.metatags?.og_image || '',
        twitter_card: 'summary_large_image',
        twitter_title: project?.metatags?.twitter_title || '',
        twitter_image: project?.metatags?.twitter_image || '',
        twitter_description: project?.metatags?.twitter_description || '',
        twitter_creator: project?.metatags?.twitter_creator || '',
        twitter_site: project?.metatags?.twitter_site || '',
        twitter_app_id_iphone: project?.metatags?.twitter_app_id_iphone || '',
        twitter_app_name_iphone: project?.metatags?.twitter_app_name_iphone || '',
        twitter_app_url_iphone: project?.metatags?.twitter_app_url_iphone || '',
        twitter_app_id_googleplay: project?.metatags?.twitter_app_id_googleplay || '',
        twitter_app_name_googleplay: project?.metatags?.twitter_app_name_googleplay || '',
        twitter_app_url_googleplay: project?.metatags?.twitter_app_url_googleplay || '',
      }}
    >
      <Form.Item>
        <Typography.Title level={5}>Main</Typography.Title>
      </Form.Item>
      <Form.Item
        name="title"
        label="Title"
        rules={[]}
        hasFeedback
        help="recommended"
      >
        <Input placeholder="Title" />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[]}
        hasFeedback
        help="recommended"
      >
        <Input placeholder="Description" />
      </Form.Item>
      <Form.Item
        name="keywords"
        label="Keywords"
        rules={[]}
        hasFeedback
        help="recommended"
      >
        <Input placeholder="Keywords" />
      </Form.Item>
      <Form.Item
        name="author"
        label="Author"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Author" />
      </Form.Item>
      <Form.Item
        name="viewport"
        label="Viewport"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Viewport" />
      </Form.Item>
      <Form.Item
        name="http_equiv_value"
        label="HTTP-Equiv Value"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="HTTP-Equiv Value" />
      </Form.Item>
      <Form.Item
        name="http_equiv_content"
        label="HTTP-Equiv Value"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="HTTP-Equiv Value" />
      </Form.Item>

      {/* GOOGLE */}
      <Form.Item>
        <Typography.Title level={5}>Google</Typography.Title>
      </Form.Item>
      <Form.Item
        name="itemprop_name"
        label="Itemprop name"
        rules={[]}
        hasFeedback
        help="recommended"
      >
        <Input placeholder="Itemprop name" />
      </Form.Item>
      <Form.Item
        name="itemprop_description"
        label="Itemprop Description"
        rules={[]}
        hasFeedback
        help="recommended"
      >
        <Input placeholder="Itemprop Description" />
      </Form.Item>
      <Form.Item
        name="itemprop_image"
        label="Itemprop Image"
        rules={[]}
        hasFeedback
        help="recommended"
      >
        <Input placeholder="Itemprop Image" />
      </Form.Item>
      <Form.Item
        name="robots"
        label="Robots"
        rules={[{ type: "array" }]}
        hasFeedback
        help="recommended"
      >
        <Select
          options={robotOptions}
          mode="multiple"
          allowClear
        />
      </Form.Item>
      <Form.Item
        name="link_canonical"
        label="Link Canonical"
        rules={[]}
        hasFeedback
        help="recommended"
      >
        <Input placeholder="Link Canonical" />
      </Form.Item>
      <Form.Item
        name="google_site_verification"
        label="Google Site Verification"
        rules={[]}
        hasFeedback
        help="recommended"
      >
        <Input placeholder="Google Site Verification" />
      </Form.Item>

      {/* FACEBOOK */}
      <Form.Item>
        <Typography.Title level={5}>Facebook</Typography.Title>
      </Form.Item>
      <Form.Item
        name="og_url"
        label="Open Graph Url"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Open Graph Url" />
      </Form.Item>
      <Form.Item
        name="og_type"
        label="Open Graph Type"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Open Graph Type" />
      </Form.Item>
      <Form.Item
        name="og_title"
        label="Open Graph Title"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Open Graph Title" />
      </Form.Item>
      <Form.Item
        name="og_description"
        label="Open Graph Description"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Open Graph Description" />
      </Form.Item>
      <Form.Item
        name="og_image"
        label="Open Graph Image"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Open Graph Image" />
      </Form.Item>

      {/* TWITTER */}
      <Form.Item>
        <Typography.Title level={5}>Twitter</Typography.Title>
      </Form.Item>
      <Form.Item
        name="twitter_title"
        label="Twitter Title"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Twitter Title" />
      </Form.Item>
      <Form.Item
        name="twitter_description"
        label="Twitter Description"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Twitter Description" />
      </Form.Item>
      <Form.Item
        name="twitter_image"
        label="Twitter Image"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Twitter Image" />
      </Form.Item>
      <Form.Item
        name="twitter_creator"
        label="Twitter Creator"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Twitter Creator" />
      </Form.Item>
      <Form.Item
        name="twitter_site"
        label="Twitter Site"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Twitter Site" />
      </Form.Item>

      {/* Twitter iOS */}
      <Form.Item>
        <Typography.Title level={5}>Twitter / Play Store</Typography.Title>
      </Form.Item>
      <Form.Item
        name="twitter_app_id_iphone"
        label="iOS App ID"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="iOS App ID" />
      </Form.Item>
      <Form.Item
        name="twitter_app_name_iphone"
        label="iOS App Name"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="iOS App Name" />
      </Form.Item>
      <Form.Item
        name="twitter_app_url_iphone"
        label="iOS App Url"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="iOS App Url" />
      </Form.Item>

      {/* Twitter Android */}
      <Form.Item>
        <Typography.Title level={5}>Twitter / Google Play</Typography.Title>
      </Form.Item>
      <Form.Item
        name="twitter_app_id_googleplay"
        label="Android App Url"
        rules={[]}
        hasFeedback

      >
        <Input placeholder="Android App Url" />
      </Form.Item>
      <Form.Item
        name="twitter_app_name_googleplay"
        label="Android App Url"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Android App Url" />
      </Form.Item>
      <Form.Item
        name="twitter_app_url_googleplay"
        label="Android App Url"
        rules={[]}
        hasFeedback
      >
        <Input placeholder="Android App Url" />
      </Form.Item>

      <Form.Item />

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Update
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ProjectMetaForm;