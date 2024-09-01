'use client';;
import {
  Button,
  Drawer,
  Flex,
  Form,
  message,
  Image,
  Input,
  Popconfirm,
  Spin,
  Typography,
  Skeleton,
  Steps,
} from "antd";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import useProjectId from "@/hooks/useProjectId";
import usePricingModal from "@/hooks/usePricingModal";
import { CaretDownOutlined } from '@ant-design/icons';
import Link from 'next/link';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { solarizedDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { IconBrandFacebook, IconBrandGoogle, IconBrandLinkedin, IconBrandX, IconCode, IconCopy, IconMarkdown, IconTextCaption } from '@tabler/icons-react';
import Label from '@/components/Label/Label';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getUserId } from "@/helpers/user";
import queryKeys from "@/helpers/queryKeys";
import prettify from "pretty";
import useProjects from "@/hooks/useProjects";
import { format } from "date-fns";
import { useState } from "react";
import useBlogPosts from "@/hooks/useBlogPosts";
import * as cheerio from "cheerio";
import { structuredSchemas } from "@/options";

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
  articleId: number;
}

const ExportBlogPostDrawer = ({
  open,
  onClose,
  articleId,
}: Props) => {
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId);
  const { getOne, update: updateBlogPost } = useBlogPosts();
  const { data: article } = getOne(articleId)
  const [form] = Form.useForm();
  const pricingModal = usePricingModal();
  const articleTitle = article?.title ?? ""
  const ogImageUrl = Form.useWatch("og_image_url", form);
  const slug = Form.useWatch("slug", form);
  const metaDescription = Form.useWatch("meta_description", form);
  const keywords = Form.useWatch("keywords", form);
  const queryClient = useQueryClient();
  const [current, setCurrent] = useState(0);
  const [isUpdatingFeaturedImage, setIsUpdatingFeaturedImage] = useState(false);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const getBlogUrl = () => {
    return project?.blog_path ?? ""
  }

  const getPreviewUrl = (prop: string) => {
    if (!project) return "";
    console.log(slug, article?.slug, project?.blog_path)
    return new URL(slug ?? article?.slug, project?.blog_path ?? "")?.[prop]
  }

  const code = prettify(`
  <title>${articleTitle}</title>
  <meta name="description" content="${metaDescription ?? article?.meta_description}">
  <meta name="keywords" content="${keywords ?? article?.keywords?.join()}" />
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />

  {/* <!-- Facebook / Pinterest --> */}
  <meta property="og:url" content="${getPreviewUrl("href")}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${articleTitle}">
  <meta property="og:description" content="${metaDescription ?? article?.meta_description}">
  <meta property="og:image" content="${ogImageUrl ?? article?.featured_image}">
  <meta property="og:site_name" content="${getPreviewUrl("host")}" />

  {/* <!-- Twitter --> */}
  <meta name="twitter:card" content="summary_large_image">
  <meta property="twitter:domain" content="${getPreviewUrl("host")}">
  <meta property="twitter:url" content="${getPreviewUrl("href")}">
  <meta name="twitter:title" content="${articleTitle}">
  <meta name="twitter:description" content="${metaDescription ?? article?.meta_description}">
  <meta name="twitter:image" content="${ogImageUrl ?? article?.featured_image}">

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
    await updateBlogPost.mutateAsync({
      ...values,
      keywords: values.keywords.split(","),
      id: article.id,
    })
    next()
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
          {current > 0 && (
            <Button onClick={() => prev()}>
              Previous
            </Button>
          )}
          {current === 0 && (
            <Button type="primary" onClick={() => form.submit()} loading={updateBlogPost.isPending}>
              Save & Preview
            </Button>
          )}
          {current === 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
          {current === 2 && (
            <Button type="primary" onClick={onClose}>
              Done
            </Button>
          )}
        </Flex>
      }
    >
      <div className="flex flex-col gap-8">
        <Steps
          size="small"
          current={current}
          onChange={(newStepNumber) => {
            if (current === 0 && newStepNumber !== current) {
              form.submit()
            } else {
              setCurrent(newStepNumber)
            }
          }}
          items={[
            {
              title: 'Settings',
            },
            {
              title: 'Preview',
            },
            {
              title: 'Export',
            },
          ]}
        />

        {current === 0 && !article && (
          <Skeleton active loading />
        )}

        {current === 0 && article && (
          <>
            <Form
              form={form}
              autoComplete="off"
              layout="vertical"
              initialValues={{
                slug: slugify(articleTitle),
                meta_description: article.meta_description ?? "",
                keywords: article.keywords ? article.keywords.join(',') ?? "" : "",
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

              <Spin spinning={isUpdatingFeaturedImage}>
                <Form.Item style={{ marginBottom: 12 }} label={<Label name="Featured image" />} name="og_image_url" rules={[{ required: false, type: "url", message: "Add a valid url" }]}>
                  <Input placeholder='https://google.com/image-url' disabled={isUpdatingFeaturedImage} />
                </Form.Item>

                <div className="flex flex-col gap-2">
                  {ogImageUrl && (
                    <img src={ogImageUrl} className="w-[150px] aspect-square object-cover rounded-lg" />
                  )}

                  <Button
                    onClick={() => {
                      try {
                        setIsUpdatingFeaturedImage(true)
                        const $ = cheerio.load(article.html);
                        const firstImageInArticle = $('img').first().attr('src') ?? "";
                        form.setFieldValue("og_image_url", firstImageInArticle)
                        setIsUpdatingFeaturedImage(false)
                      } catch {
                        setIsUpdatingFeaturedImage(false)
                      }
                    }}
                    className="w-fit"
                  >
                    Use 1st image in content
                  </Button>
                </div>
              </Spin>
            </Form>

            <Flex vertical gap="small" className="relative">
              <SyntaxHighlighter style={solarizedDark}>
                {code}
              </SyntaxHighlighter>
              <Button
                onClick={onCopyHTML}
                icon={<IconCopy />}
                className="absolute top-2 right-2"
              />
            </Flex>

            <div className="flex flex-col gap-4">
              <Label name="Generate structured data" />
              <Flex gap="small" style={{ flexWrap: "wrap" }}>
                {/* [
                  "BreadcrumbList",
                  "VideoObject",
                  "Recipe",
                  "Article",
                  "WebSite",
                  "WebPage",
                  "BlogPosting",
                  "FAQPage",
                  "Question",
                ] */}
                {structuredSchemas.map(({ label: schemaName }) => {
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

              <Spin spinning={onGenerateSchemaMarkup.isPending}>
                <Flex vertical gap="small" className="relative">
                  <div>
                    <SyntaxHighlighter style={solarizedDark}>
                      {schemaMarkup}
                    </SyntaxHighlighter>
                  </div>
                  <Button
                    onClick={onCopySchemaMarkup}
                    icon={<IconCopy />}
                    className="absolute top-2 right-2"
                  />
                </Flex>
              </Spin>
            </div>
          </>
        )}

        {current === 1 && (
          <>
            <Flex vertical gap="small">
              <IconBrandGoogle />
              <div>
                <Link href="" style={styles.google.title}>
                  {article.title}
                </Link>
                <Flex>
                  <Typography.Text style={styles.google.url}>{getPreviewUrl("href")}</Typography.Text>
                  <CaretDownOutlined style={styles.google.arrow} />
                </Flex>
                <Typography.Text style={styles.google.description}>{article.meta_description}</Typography.Text>
              </div>
            </Flex>

            <Flex vertical gap="small">
              <IconBrandX />
              <div style={{ position: "relative", cursor: "pointer" }}>
                <Image
                  src={article.og_image_url}
                  preview={false}
                  style={{
                    borderRadius: ".85714em",
                  }}
                  className="max-h-[500px] object-cover"
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

            <Flex vertical gap="small">
              <IconBrandFacebook />

              <div style={{ fontFamily: "Helvetica", cursor: "pointer", border: "1px solid rgb(229 231 235/1)" }}>
                <Image
                  src={article.og_image_url}
                  preview={false}
                  className="max-h-[500px] object-cover"
                />

                <Flex vertical style={{ padding: 12, background: "rgb(242 243 245 / 1)", borderTop: "1px solid rgb(229 231 235/1)" }}>
                  <Typography.Text
                    style={{ fontSize: 12, color: "rgb(96 103 112/1)", textTransform: "uppercase" }}
                  >
                    {getPreviewUrl("host")}
                  </Typography.Text>
                  <Typography.Text style={{ color: "rgb(29 33 41/1)", fontWeight: 600, marginTop: 2, fontSize: 16 }}>{article.title}</Typography.Text>
                  <Typography.Text style={{ color: "rgb(96 103 112/1)", fontSize: 14, marginTop: 3 }}>{article.meta_description}</Typography.Text>
                </Flex>
              </div>
            </Flex>

            <Flex vertical gap="small">
              <IconBrandLinkedin />
              <div style={{ fontFamily: "Helvetica", cursor: "pointer", borderRadius: 2, boxShadow: "0 0 #0000,0 0 #0000,0 0 #0000,0 0 #0000,0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1)" }}>
                <Image
                  src={article.og_image_url}
                  preview={false}
                  style={{ border: "1px solid rgb(229 231 235/1)" }}
                  className="max-h-[500px] object-cover"
                />

                <Flex vertical style={{ padding: 10, background: "white", borderTop: "1px solid rgb(229 231 235/1)" }}>
                  <Typography.Text style={{ color: "rgb(29 33 41/1)", fontWeight: 600, marginBottom: 2, fontSize: 16 }}>{article.title}</Typography.Text>
                  <Typography.Text
                    style={{ fontSize: 12, color: "rgb(96 103 112/1)", textTransform: "uppercase" }}
                  >
                    {getPreviewUrl("host")}
                  </Typography.Text>
                </Flex>
              </div>
            </Flex>
          </>
        )}

        {current === 2 && (
          <div className="grid grid-cols-2 gap-4">

            <div
              onClick={() => {
                navigator.clipboard.writeText(prettify(`
<html>
<head>
${code}
${schemaMarkup}
<head>
<body>
<h1>${article.title ?? ""}</h1>
${article.html}
</body>
</html>
`));
                message.success("html copied to clipboard")
              }}
              className="flex items-center justify-center border rounded-md py-6 cursor-pointer hover:bg-primary-500 hover:text-white"
            >
              <div className="flex flex-col gap-2 items-center">
                <IconCode />
                <p className="text-lg font-medium">HTML</p>
              </div>
            </div>

            <div
              onClick={() => {
                navigator.clipboard.writeText(`---
title: "${article.title ?? ""}"
description: "${article.meta_description ?? ""}"
image: ${article.og_image_url ?? ""}
keywords: "${article.keywords.join() ?? ""}"
date: ${format(article.created_at, "yyyy-MM-dd")}
modified: ${format(new Date(), "yyyy-MM-dd")}
active: true
${article?.schema_markups?.length > 0 ? `schema_markups: ${JSON.stringify(article?.schema_markups, null, 2)}` : ""}
---

#${article.title ?? ""}

${article.markdown}
`);
                message.success("markdown copied to clipboard")
              }}
              className="flex items-center justify-center border rounded-md py-6 cursor-pointer hover:bg-primary-500 hover:text-white"
            >
              <div className="flex flex-col gap-2 items-center">
                <IconMarkdown />
                <p className="text-lg font-medium">Markdown</p>
              </div>
            </div>

            <div
              onClick={() => {
                const $ = cheerio.load(article.html);
                navigator.clipboard.writeText([article?.title ?? "", $.text()].join('\n\n'));
                message.success("text copied to clipboard")
              }}
              className="flex items-center justify-center border rounded-md py-6 cursor-pointer hover:bg-primary-500 hover:text-white"
            >
              <div className="flex flex-col gap-2 items-center">
                <IconTextCaption />
                <p className="text-lg font-medium">Text</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default ExportBlogPostDrawer
