'use client';;
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useBlogPosts from '@/hooks/useBlogPosts';
import {
  App,
  Button,
  Col,
  Dropdown,
  Flex,
  Form,
  Image,
  Input,
  Popconfirm,
  Row,
  Spin,
  Typography,
} from 'antd';
import { getSummary } from 'readability-cyr';
import { useRouter } from 'next/navigation';
import { CopyOutlined, SaveOutlined, CaretDownOutlined } from '@ant-design/icons';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import "./styles.css";
import Link from 'next/link';
import useProjects from '@/hooks/useProjects';
import SyntaxHighlighter from 'react-syntax-highlighter';
// import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { solarizedDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import prettify from "pretty";
import { IconBrandFacebook, IconBrandGoogle, IconBrandLinkedin, IconBrandX } from '@tabler/icons-react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import queryKeys from '@/helpers/queryKeys';
import { format } from 'date-fns';
import Label from '@/components/Label/Label';

const { Text } = Typography;

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

const mock = {
  url: "https://metatags.io/",
  slug: "/fake-slug",
  description: "With Meta Tags you can edit and experiment with your content then preview how your webpage will look on Google, Facebook, Twitter and more!",
  og_image_url: "https://assets-global.website-files.com/647daf37f31ac13e5d14bb03/64fef99a4049a05b307b7400_Taplio%20open%20graph%20image.webp"
}

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

const Article = ({
  params,
}: {
  params: { article_id: number, project_id: number }
}) => {
  const articleId = +params.article_id;
  const projectId = +params.project_id;
  const {
    data: article,
    isPending,
    isError
  } = useBlogPosts().getOne(articleId)
  const { data: project } = useProjects().getOne(projectId);
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const { message } = App.useApp();
  const [seoForm] = Form.useForm();
  const articleTitle = Form.useWatch("title", seoForm);
  const ogImageUrl = Form.useWatch("og_image_url", seoForm);
  const slug = Form.useWatch("slug", seoForm);
  const metaDescription = Form.useWatch("meta_description", seoForm);
  const keywords = Form.useWatch("keywords", seoForm);

  const editorRef = useRef<any>(null);
  const html = useRef<any>(null);
  const text = useRef<any>(null);
  const markdown = useRef<any>(null);

  const getReadabilityName = (value: any) => {
    if (isNaN(value)) {
      return ""
    }

    const readabilityScore = Math.round(value);

    if (readabilityScore >= 90) {
      return '5th grade'
    }
    if (readabilityScore >= 80) {
      return '6th grade'
    }
    if (readabilityScore >= 70) {
      return '7th grade'
    }
    if (readabilityScore >= 60) {
      return '8th/9th grade'
    }
    if (readabilityScore >= 50) {
      return '10th/12th grade'
    }
    if (readabilityScore >= 30) {
      return 'College'
    }
    if (readabilityScore >= 10) {
      return `College graduate (${readabilityScore})`
    }
    return 'Professional'
  }

  const getPreviewUrl = (prop: string) => {
    if (!project) return "";
    return new URL(slug, project.website)?.[prop]
  }

  const code = prettify(`
  {/* <!-- HTML --> */}
  <title>${articleTitle}</title>
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

  const onGenerateSchemaMarkup = useMutation({
    mutationFn: (schemaName: string) => {
      return axios.post("/api/schema-markup", {
        schema: schemaName,
        project_id: project.id,
        article_id: articleId,
        language_id: article.language_id,
      })
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: queryKeys.blogPost(articleId)
      })
    }
  })

  if (isError) return null

  return (
    <Spin spinning={isPending || !article}>
      <Row>
        <Col xs={24} sm={11} md={{ span: 14 }} lg={12}>
          {article && (
            <Editor
              ref={editorRef}
              onInit={(evt, ref) => {
                html.current = ref.startContent
                text.current = ref.contentAreaContainer?.innerText || ""
                markdown.current = NodeHtmlMarkdown.translate(ref.startContent)
                // onSaveEditor(html.current);
                setStats(getSummary(text.current))
              }}
              apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'
              // setup={ (editor) => {
              //   editor.on('change', (e) => {
              // tinymce.get('editor').getContent()
              //   })
              // }}
              init={{
                content_css: 'default',
                height: '100%',
                // width: 700,
                // menubar: false,
                plugins: [
                  'autolink', 'autoresize', 'link', 'lists', 'media',
                  'image', 'quickbars', 'help'
                ],
                autosave_ask_before_unload: true,
                autosave_interval: '30s',
                skin: 'borderless',
                // toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link image blockquote | align bullist numlist | code',
                content_style: `
                  img {
                    max-width: 100%;
                  }
                  .tox-tinymce {
                    border: 0 !important;
                  }
                  .tox-editor-header {
                    box-shadow: none !important;
                  }
                `,
                toolbar: false,
                menubar: false,
                inline: true,
                quickbars_insert_toolbar: 'image media',
                quickbars_selection_toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link blockquote | align bullist numlist | code',
                // contextmenu: 'export wordcount ai tinymcespellchecker autocorrect a11ychecker typography inlinecss',
                // plugins: 'ai tinycomments mentions anchor autolink codesample emoticons image link lists media searchreplace table wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
                // toolbar: 'export | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough removeformat | link image media table | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons wordcount',
                // tinycomments_mode: 'embedded',
                // tinycomments_author: 'Author name',
                // ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
              }}
              initialValue={article.html}
              onEditorChange={(content) => {
                html.current = content
                text.current = editorRef.current?.editor?.contentAreaContainer?.innerText || ""
                markdown.current = NodeHtmlMarkdown.translate(content)
                setIsSaved(editorRef.current?.editor?.isNotDirty)
                setStats(getSummary(text.current))
              }}
            />
          )}
        </Col>
        <Col xs={0} sm={5} md={{ span: 8, offset: 2 }} lg={{ span: 8, offset: 4 }} >
          {!!stats && (
            <Flex
              vertical
            // style={{ position: "sticky", top: 16 }}
            >
              <Flex justify='end' style={{ marginBottom: 16 }} gap="small">
                {/* <Button icon={<CloudUploadOutlined />}>Export</Button> */}
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: '1',
                        label: "html",
                        onClick: () => {
                          navigator.clipboard.writeText(html.current);
                          message.success("html copied to clipboard")
                        }
                      },
                      {
                        key: '2',
                        label: "markdown",
                        onClick: () => {
                          navigator.clipboard.writeText(markdown.current);
                          message.success("markdown copied to clipboard")
                        }
                      },
                      {
                        key: '3',
                        label: ".md",
                        onClick: () => {
                          navigator.clipboard.writeText(`---
title: "${seoForm.getFieldValue("title") ?? ""}"
description: "${seoForm.getFieldValue("meta_description") ?? ""}"
image: ${seoForm.getFieldValue("og_image_url") ?? ""}
keywords: "${seoForm.getFieldValue("keywords") ?? ""}"
date: ${format(new Date(), "yyyy-MM-dd")}
modified: ${format(new Date(), "yyyy-MM-dd")}
active: true
${article?.schema_markups?.length > 0 ? `schema_markups: ${JSON.stringify(article?.schema_markups, null, 2)}` : ""}
---

${markdown.current}
                          `);
                          message.success("markdown copied to clipboard")
                        }
                      },
                      {
                        key: '4',
                        label: "text",
                        onClick: () => {
                          navigator.clipboard.writeText(text.current);
                          message.success("text copied to clipboard")
                        }
                      },
                    ]
                  }}
                  placement="bottomLeft"
                >
                  <Button icon={<CopyOutlined />}>Copy</Button>
                </Dropdown>
                <Button type="primary" icon={<SaveOutlined />}>Save</Button>
              </Flex>

              {!!project && !!article && (
                <Form
                  form={seoForm}
                  autoComplete="off"
                  layout="vertical"
                  initialValues={{
                    title: article.title,
                    slug: slugify(article.title),
                    meta_description: article.meta_description ?? "",
                    keywords: article.keywords?.slice(0, 9).join(',') ?? "",
                    og_image_url: article.featured_image ?? "",
                  }}
                >
                  <Form.Item style={{ marginBottom: 12 }} label={<Label name="Title" />} name="title" rules={[{ required: true, type: "string", message: "Add a title" }]}>
                    <Input placeholder='Title' />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 12 }} label={<Label name="Slug" />} name="slug" rules={[{ required: true, type: "string", message: "Add a slug" }]}>
                    <Input placeholder='/article-slug-here' />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 28 }} label={<Label name="Meta description" />} name="meta_description" help="160 characters max recommended" rules={[{ required: false, type: "string", message: "Add a meta description" }]}>
                    <Input placeholder='Add a meta description' />
                  </Form.Item>
                  <Form.Item style={{ marginBottom: 12 }} label={<Label name="Keywords" />} name="keywords" tooltip="Separate the keywords with a comma" rules={[{ required: false, type: "string", message: "Add keywords" }]}>
                    <Input placeholder='Add keywords' />
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
                          <Text style={{ fontSize: 18 }} style={styles.google.url}>{getPreviewUrl("href")}</Text>
                          <CaretDownOutlined style={styles.google.arrow} />
                        </Flex>
                        <Text style={styles.google.description}>{metaDescription}</Text>
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
                          <Text
                            style={{ fontSize: ".75rem", color: "white" }}
                          >
                            {getPreviewUrl("host")}
                          </Text>
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
                          <Text
                            style={{ fontSize: 12, color: "rgb(96 103 112/1)", textTransform: "uppercase" }}
                          >
                            {getPreviewUrl("host")}
                          </Text>
                          <Text style={{ color: "rgb(29 33 41/1)", fontWeight: 600, marginTop: 2, fontSize: 16 }}>{articleTitle}</Text>
                          <Text style={{ color: "rgb(96 103 112/1)", fontSize: 14, marginTop: 3 }}>{metaDescription}</Text>
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
                          <Text style={{ color: "rgb(29 33 41/1)", fontWeight: 600, marginBottom: 2, fontSize: 16 }}>{articleTitle}</Text>
                          <Text
                            style={{ fontSize: 12, color: "rgb(96 103 112/1)", textTransform: "uppercase" }}
                          >
                            {getPreviewUrl("host")}
                          </Text>
                        </Flex>
                      </div>
                    </Flex>
                  </Form.Item>

                  <Form.Item>
                    <Flex vertical gap="small">
                      <SyntaxHighlighter style={solarizedDark}>
                        {code}
                      </SyntaxHighlighter>
                      <Button onClick={onCopyHTML} type="primary" size="large" style={{ width: "100%" }} icon={<CopyOutlined />}>Copy to clipboard</Button>
                    </Flex>
                  </Form.Item>

                  <Form.Item label={<Label name="Add schema markup (ld+json)" />}>
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
                            okText="Yes (3 credits)"
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
                        <Button onClick={onCopySchemaMarkup} type="primary" size="large" style={{ width: "100%" }} icon={<CopyOutlined />}>Copy to clipboard</Button>
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

              {/* <Text strong>Readability</Text>
              <Text style={{ marginBottom: 6 }}>{getReadabilityName(stats.FleschKincaidGrade)}</Text>

              <Text strong>Reading time</Text>
              <Text style={{ marginBottom: 6 }}>{stats.readingTime}</Text>

              <Text strong>Words</Text>
              <Text style={{ marginBottom: 6 }}>{stats.words}</Text>

              <Text strong>Sentences</Text>
              <Text style={{ marginBottom: 6 }}>{stats.sentences}</Text>

              <Text strong>Paragraphs</Text>
              <Text style={{ marginBottom: 6 }}>{stats.paragraphs}</Text> */}
            </Flex>
          )}
        </Col>
      </Row>
    </Spin>
  )

  // return !isError && !isPending && article && (
  //   <Flex justify='center' style={{ height: "100%", width: 700, margin: "auto" }}>
  //     <Editor
  //       ref={editorRef}
  //       onInit={(evt, ref) => {
  //         html.current = ref.startContent
  //         // onSaveEditor(html.current);
  //       }}
  //       apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'
  //       // setup={ (editor) => {
  //       //   editor.on('change', (e) => {
  //       //     $.ajax({
  //       //       type: 'POST',
  //       //       url: 'php/save.php',
  //       //       data: {
  //       //         editor: tinymce.get('editor').getContent()
  //       //       },
  //       //       success: function(data){
  //       //         $('#editor').val('');
  //       //         console.log(data)
  //       //       }
  //       //     })
  //       //   })
  //       // }}
  //       init={{
  //         content_css: 'default',
  //         height: '100%',
  //         width: 700,
  //         // menubar: false,
  //         plugins: [
  //           'autolink', 'autoresize', 'link', 'lists', 'media',
  //           'image', 'quickbars', 'help'
  //         ],
  //         autosave_ask_before_unload: true,
  //         autosave_interval: '30s',
  //         skin: 'borderless',
  //         // toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link image blockquote | align bullist numlist | code',
  //         content_style: `
  //           img {
  //             max-width: 100%;
  //           }
  //           .tox-tinymce {
  //             border: 0 !important;
  //           }
  //           .tox-editor-header {
  //             box-shadow: none !important;
  //           }
  //         `,
  //         toolbar: false,
  //         menubar: false,
  //         inline: true,
  //         quickbars_insert_toolbar: 'image media',
  //         quickbars_selection_toolbar: 'undo redo | blocks | forecolor backcolor | bold italic underline strikethrough | link blockquote | align bullist numlist | code',
  //         // contextmenu: 'export wordcount ai tinymcespellchecker autocorrect a11ychecker typography inlinecss',
  //         // plugins: 'ai tinycomments mentions anchor autolink codesample emoticons image link lists media searchreplace table wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
  //         // toolbar: 'export | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough removeformat | link image media table | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons wordcount',
  //         // tinycomments_mode: 'embedded',
  //         // tinycomments_author: 'Author name',
  //         // ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
  //       }}
  //       initialValue={article.html}
  //       onEditorChange={(content) => {
  //         html.current = content
  //         setIsSaved(editorRef.current?.editor?.isNotDirty)
  //       }}
  //     />
  //   </Flex>
  // )
}

export default Article;