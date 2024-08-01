'use client';;
import {
  Button,
  Drawer,
  Dropdown,
  Flex,
  Form,
  message,
  Image,
  Input,
  Popconfirm,
  Spin,
  Typography,
  Skeleton
} from "antd";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import useProjectId from "@/hooks/useProjectId";
import usePricingModal from "@/hooks/usePricingModal";
import { CopyOutlined } from '@ant-design/icons';
import { CaretDownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { solarizedDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IconBrandFacebook, IconBrandGoogle, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
import Label from '@/components/Label/Label';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getUserId } from "@/helpers/user";
import queryKeys from "@/helpers/queryKeys";
import prettify from "pretty";
import useProjects from "@/hooks/useProjects";
import { format } from "date-fns";

const styles = {
  google: {
    title: {
      display: "block",
      letterSpacing: "normal",
      color: "#1a0dab",
      cursor: "pointer",
      fontSize: 18,
      lineHeight: 1.2,
      fontFamily: "Arial, sans-serif",
      "-webkit-font-smoothing": "subpixel-antialiased",
      // overflow: "hidden",
      // textOverflow: "ellipsis",
      // whiteSpace: "nowrap",
    },
    url: {
      fontSize: 14,
      letterSpacing: "normal",
      color: "#006621",
      marginRight: 4,
      fontFamily: "Arial, sans-serif",
      "-webkit-font-smoothing": "subpixel-antialiased",
    },
    arrow: {
      color: "#006621",
      margin: 0,
      padding: 0
    },
    description: {
      color: "#545454",
      fontSize: 13,
      lineHeight: 1.4,
      wordWrap: "break-word",
      fontFamily: "Arial, sans-serif",
      "-webkit-font-smoothing": "subpixel-antialiased",
    }
  },
  x: {
    card: {
      cursor: "pointer",
      fontSize: 14,
      fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Ubuntu, Helvetica Neue, sans-serif",
      "-webkit-font-smoothing": "antialiased",
    },
    title: {
      // overflow: "hidden",
      // textOverflow: "ellipsis",
      // whiteSpace: "nowrap",
      fontSize: "0.95em",
      fontWeight: 700,
      lineHeight: "1.3em",
      // maxHeight: "1.3em",
      marginBottom: 4
    },
    description: {
      marginBottom: 4
    },
    url: {

    }
  }
}

const slugify = (text: string) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')

type Props = {
  open: boolean;
  onClose: () => void;
  article: any;
  markdown: string;
  html: string;
}

const ExportBlogPostDrawer = ({
  open,
  onClose,
  article,
  html,
  markdown,
}: Props) => {
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId);
  const [form] = Form.useForm();
  const pricingModal = usePricingModal();
  const articleTitle = article?.title ?? ""
  const ogImageUrl = Form.useWatch("og_image_url", form);
  const slug = Form.useWatch("slug", form);
  const metaDescription = Form.useWatch("meta_description", form);
  const keywords = Form.useWatch("keywords", form);
  const queryClient = useQueryClient();

  const getBlogUrl = () => {
    if (!project) return "";
    return new URL(`${project.blog_path}`, new URL(project.website).href).href
  }

  const getPreviewUrl = (prop: string) => {
    if (!project) return "";
    return new URL(slug, getBlogUrl())?.[prop]
  }

  const code = prettify(`
  {/* <!-- HTML --> */}
  <title>${articleTitle || article?.title}</title>
  <meta name="description" content="${metaDescription}">
  <meta name="keywords" content="${keywords}" />
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />

  {/* <!-- Facebook / Pinterest --> */}
  <meta property="og:url" content="${getPreviewUrl("href")}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${articleTitle}">
  <meta property="og:description" content="${metaDescription}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:site_name" content="${getPreviewUrl("host")}" />

  {/* <!-- Twitter --> */}
  <meta name="twitter:card" content="summary_large_image">
  <meta property="twitter:domain" content="${getPreviewUrl("host")}">
  <meta property="twitter:url" content="${getPreviewUrl("href")}">
  <meta name="twitter:title" content="${articleTitle}">
  <meta name="twitter:description" content="${metaDescription}">
  <meta name="twitter:image" content="${ogImageUrl}">

  {/* <!-- Generated via https://usehubrank.com --> */}
`)

  const schemaMarkup = prettify(`
<script type="application/ld+json">
${JSON.stringify(article?.schema_markups ?? {})}
</script>
`)

  const onCopyHTML = () => {
    navigator.clipboard.writeText(code);
    message.success("Copied to clipboard!");
  }

  const onCopySchemaMarkup = () => {
    navigator.clipboard.writeText(schemaMarkup);
    message.success("Copied to clipboard!");
  }

  const onSaveForm = async (values: any) => {
    console.log(values)
    message.success("Saved.");
  }

  const onGenerateSchemaMarkup = useMutation({
    mutationFn: async (schemaName: string) => {
      const { data } = await axios.post('/api/credits-check', {
        user_id: await getUserId(),
        action: 'schema-markup'
      });
      if (!data.authorized) {
        return pricingModal.open(true)
      }
      return axios.post("/api/schema-markup", {
        schema: schemaName,
        project_id: projectId,
        article_id: article.id,
        language_id: article.language_id,
        user_id: await getUserId(),
      })

    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blogPost(article.id)
      })
    },
    onError() {
      message.error("An error occured, please try again.")
    },
  })

  return (
    <Drawer
      title={<DrawerTitle title="Export blog post" />}
      width={600}
      onClose={() => {
        onClose();
        form.resetFields()
      }}
      open={open}
      destroyOnClose
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      footer={
        <Flex justify="end" align="center" gap="middle">
          <Button onClick={onClose}>Cancel</Button>
          <Dropdown
            menu={{
              items: [
                {
                  key: '1',
                  label: "html",
                  onClick: () => {
                    navigator.clipboard.writeText(html);
                    message.success("html copied to clipboard")
                  }
                },
                {
                  key: '2',
                  label: "markdown",
                  onClick: () => {
                    navigator.clipboard.writeText(markdown);
                    message.success("markdown copied to clipboard")
                  }
                },
                {
                  key: '3',
                  label: ".md",
                  onClick: () => {
                    navigator.clipboard.writeText(`---
                title: "${form.getFieldValue("title") ?? ""}"
                description: "${form.getFieldValue("meta_description") ?? ""}"
                image: ${form.getFieldValue("og_image_url") ?? ""}
                keywords: "${form.getFieldValue("keywords") ?? ""}"
                date: ${format(new Date(), "yyyy-MM-dd")}
                modified: ${format(new Date(), "yyyy-MM-dd")}
                active: true
                ${article?.schema_markups?.length > 0 ? `schema_markups: ${JSON.stringify(article?.schema_markups, null, 2)}` : ""}
                ---

                ${markdown}
`);
                    message.success("markdown copied to clipboard")
                  }
                },
                {
                  key: '4',
                  label: "text",
                  onClick: () => {
                    navigator.clipboard.writeText();
                    message.success("text copied to clipboard")
                  }
                },
              ]
            }}
            placement="bottomLeft"
          >
            <Button type="primary" icon={<CopyOutlined />}>Export</Button>
          </Dropdown>
        </Flex>
      }
    >
      {!article ? (
        <Skeleton active loading />
      ) : (
        <Form
          form={form}
          autoComplete="off"
          layout="vertical"
          initialValues={{
            slug: slugify(articleTitle),
            meta_description: article.meta_description ?? "",
            keywords: article.keywords?.slice(0, 9).join(',') ?? "",
            og_image_url: article.featured_image ?? "",
          }}
          onFinish={onSaveForm}
          scrollToFirstError
        >
          <Form.Item style={{ marginBottom: 12 }} label={<Label name="Slug" />} name="slug" rules={[{ required: true, type: "string", message: "Add a slug" }]}>
            <Input addonBefore={getBlogUrl()} placeholder='/article-slug-here' />
          </Form.Item>
          <Form.Item style={{ marginBottom: 28 }} label={<Label name="Meta description" />} name="meta_description" help="160 characters max recommended" rules={[{ required: false, type: "string", message: "Add a meta description" }]}>
            <Input placeholder='Add a meta description' />
          </Form.Item>
          <Form.Item style={{ marginBottom: 28 }} label={<Label name="Keywords" />} name="keywords" help="Separate the keywords with a comma" rules={[{ required: false, type: "string", message: "Add keywords" }]}>
            <Input.TextArea rows={5} placeholder='Add keywords' />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }} label={<Label name="Image" />} name="og_image_url" rules={[{ required: false, type: "url", message: "Add a valid url" }]}>
            <Input placeholder='https://google.com/image-url' />
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <Flex vertical gap="small">
              <IconBrandGoogle />
              <div>
                <Link href="" style={styles.google.title}>
                  {articleTitle}
                </Link>
                <Flex>
                  <Typography.Text style={styles.google.url}>{getPreviewUrl("href")}</Typography.Text>
                  <CaretDownOutlined style={styles.google.arrow} />
                </Flex>
                <Typography.Text style={styles.google.description}>{metaDescription}</Typography.Text>
              </div>
            </Flex>
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <Flex vertical gap="small">
              <IconBrandX />
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Image
                  src={ogImageUrl}
                  preview={false}
                  style={{
                    borderRadius: ".85714em",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: 8, bottom: 8,
                    backgroundColor: "rgb(0 0 0 / 0.4)",
                    padding: "0px 4px",
                    borderRadius: "0.25rem"
                  }}
                >
                  <Typography.Text
                    style={{ fontSize: ".75rem", color: "white" }}
                  >
                    {getPreviewUrl("host")}
                  </Typography.Text>
                </div>
              </div>
            </Flex>
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <Flex vertical gap="small">
              <IconBrandFacebook />

              <div style={{ fontFamily: "Helvetica", cursor: "pointer", border: "1px solid rgb(229 231 235/1)" }}>
                <Image
                  src={ogImageUrl}
                  preview={false}
                />

                <Flex vertical style={{ padding: 12, background: "rgb(242 243 245 / 1)", borderTop: "1px solid rgb(229 231 235/1)" }}>
                  <Typography.Text
                    style={{ fontSize: 12, color: "rgb(96 103 112/1)", textTransform: "uppercase" }}
                  >
                    {getPreviewUrl("host")}
                  </Typography.Text>
                  <Typography.Text style={{ color: "rgb(29 33 41/1)", fontWeight: 600, marginTop: 2, fontSize: 16 }}>{articleTitle}</Typography.Text>
                  <Typography.Text style={{ color: "rgb(96 103 112/1)", fontSize: 14, marginTop: 3 }}>{metaDescription}</Typography.Text>
                </Flex>
              </div>
            </Flex>
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <Flex vertical gap="small">
              <IconBrandLinkedin />
              <div style={{ fontFamily: "Helvetica", cursor: "pointer", borderRadius: 2, boxShadow: "0 0 #0000,0 0 #0000,0 0 #0000,0 0 #0000,0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)" }}>
                <Image
                  src={ogImageUrl}
                  preview={false}
                  style={{ border: "1px solid rgb(229 231 235/1)" }}
                />

                <Flex vertical style={{ padding: 10, background: "white", borderTop: "1px solid rgb(229 231 235/1)" }}>
                  <Typography.Text style={{ color: "rgb(29 33 41/1)", fontWeight: 600, marginBottom: 2, fontSize: 16 }}>{articleTitle}</Typography.Text>
                  <Typography.Text
                    style={{ fontSize: 12, color: "rgb(96 103 112/1)", textTransform: "uppercase" }}
                  >
                    {getPreviewUrl("host")}
                  </Typography.Text>
                </Flex>
              </div>
            </Flex>
          </Form.Item>

          <Form.Item>
            <Flex vertical gap="small">
              <SyntaxHighlighter style={solarizedDark}>
                {code}
              </SyntaxHighlighter>
              <Button onClick={onCopyHTML} size="large" style={{ width: "100%" }} icon={<CopyOutlined />}>Copy to clipboard</Button>
            </Flex>
          </Form.Item>

          <Form.Item label={<Label name="Select a structured data" />}>
            <Flex gap="small" style={{ flexWrap: "wrap" }}>
              {[
                "BreadcrumbList",
                "VideoObject",
                "Recipe",
                "Article",
                "WebSite",
                "WebPage",
                "BlogPosting",
                "FAQPage",
                "Question",
              ].map((schemaName) => {
                return (
                  <Popconfirm
                    title="Schema markup"
                    description={(
                      <span>Do you want to generate a new <b>{schemaName}</b> schema?</span>
                    )}
                    onConfirm={() => onGenerateSchemaMarkup.mutate(schemaName)}
                    onCancel={() => { }}
                    okText="Yes (0.25 credit)"
                    cancelText="No"
                  >
                    <Button>{schemaName}</Button>
                  </Popconfirm>
                )
              })}
            </Flex>
          </Form.Item>

          <Spin spinning={onGenerateSchemaMarkup.isPending}>
            <Form.Item>
              <Flex vertical gap="small">
                <div>
                  <SyntaxHighlighter style={solarizedDark}>
                    {schemaMarkup}
                  </SyntaxHighlighter>
                </div>
                <Button onClick={onCopySchemaMarkup} size="large" style={{ width: "100%" }} icon={<CopyOutlined />}>Copy to clipboard</Button>
              </Flex>
            </Form.Item>
          </Spin>

          {/* <Form.Item style={{ marginBottom: 12 }}>
                <Flex vertical gap="small">
                  <Texty" style={{fontSize:184}}>X</Text>
                  <div>
                    <Card
                      style={styles.x.card}
                      cover={<img alt="example" src={ogImageUrl} />}
                    >
                      <Flex vertical>
                        <Text style={styles.x.title}>{article.title}</Text>
                        <Text style={styles.x.description}>{metaDescription}</Text>
                        <Texty" style={{fontSize:184}} style={styles.x.url}>{getPreviewUrl()}</Text>
                      </Flex>
                    </Card>
                  </div>
                </Flex>
              </Form.Item> */}
        </Form>
      )}
    </Drawer>
  )
}

export default ExportBlogPostDrawer