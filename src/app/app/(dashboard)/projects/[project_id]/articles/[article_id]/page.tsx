'use client';;
import { useEffect, useMemo, useState } from 'react';
import useBlogPosts from '@/hooks/useBlogPosts';
import {
  Button,
  Flex,
  Form,
  Image,
  Input,
  message,
  Popconfirm,
  Skeleton,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { useRouter } from 'next/navigation';
import useProjects from '@/hooks/useProjects';
import { ArrowLeftOutlined, CaretDownOutlined } from '@ant-design/icons';
import ExportBlogPostDrawer from '@/components/ExportBlogPostDrawer/ExportBlogPostDrawer';
import useDrawers from '@/hooks/useDrawers';
import { debounce } from 'lodash';
import {
  IconBrandFacebook,
  IconBrandGoogle,
  IconBrandLinkedin,
  IconBrandX,
  IconChevronDown,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconCopy,
} from '@tabler/icons-react';
import TiptapEditor from './TiptapEditor/TiptapEditor';
import { slugify } from '@/helpers/text';
import { getSEOChecks } from '@/helpers/seo';
import AddMediaModal from '@/components/AddMediaModal/AddMediaModal';
import cheerio from "cheerio";
import { SearchOutlined } from '@ant-design/icons';
import { structuredSchemas } from '@/options';
import Label from '@/components/Label/Label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getUserId } from '@/helpers/user';
import usePricingModal from '@/hooks/usePricingModal';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { solarizedDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import queryKeys from '@/helpers/queryKeys';
import prettify from "pretty";
import Link from 'next/link';
import PublishBlogPostButton from '@/components/PublishBlogPostButton/PublishBlogPostButton';

const styles = {
  google: {
    title: "block text-base font-normal text-[#1a0dab] cursor-pointer font-sans",
    url: "text-sm text-[#006621] mr-1 font-sans",
    arrow: "text-[#006621] m-0 p-0",
    description: "text-sm text-[#545454] font-sans",
  },
  x: {
    card: "cursor-pointer text-base font-sans",
    title: "text-sm font-bold mb-1",
    description: "mb-1",
    url: "",
  }
}

type Props = {
  isChecked: React.ReactNode;
  title: string | React.ReactNode;
  children: React.ReactNode;
}

const Collapse = ({
  isChecked,
  title,
  children,
}: Props) => {
  const [show, setShow] = useState(false);

  return (
    <div className='flex flex-col gap-2 w-full'>
      <div className='flex flex-row justify-between w-full cursor-pointer p-2 rounded-lg' onClick={() => setShow(!show)}>
        <div className='flex items-start gap-2'>
          {isChecked}
          <p>{title}</p>
        </div>

        <IconChevronDown stroke={1} className={show ? 'rotate-180' : ''} />
      </div>

      {show && <div className='flex-col gap-2 pl-6 mb-4'>{children}</div>}
    </div>
  );
};

const Article = ({
  params,
}: {
  params: { article_id: number, project_id: number }
}) => {
  const articleId = +params.article_id;
  const projectId = +params.project_id;
  const { getOne, update: updateBlogPost } = useBlogPosts()
  const { data: article, isError } = getOne(articleId)
  const { data: project } = useProjects().getOne(projectId);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();
  const [articleTitle, setArticleTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [isUpdatingFeaturedImage, setIsUpdatingFeaturedImage] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [featuredImageForm] = Form.useForm();
  const ogImageUrl = Form.useWatch("featured_image", featuredImageForm);
  const pricingModal = usePricingModal();
  const queryClient = useQueryClient();
  const [seoForm] = Form.useForm();
  const drawers = useDrawers();

  const getBlogUrl = () => {
    return project?.blog_path ?? ""
  }

  useEffect(() => {
    if (article) {
      setMarkdown(article.markdown)
      setStats(article.markdown);
      setArticleTitle(article?.title ?? "")
    }
  }, [article]);

  const getPreviewUrl = (prop: string) => {
    return new URL(article?.slug, project?.blog_path ?? "")?.[prop]
  }

  const seoChecks = useMemo(() => {
    if (!article.html) return

    const { href, host } = new URL(article?.slug, project?.blog_path ?? "");

    const html = `
<html>
<head>
  <title>${article.title ?? ""}</title>
  <meta name="description" content="${article?.meta_description}">
  <meta name="keywords" content="${article?.keywords?.join()}" />
  <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />

  {/* <!-- Facebook / Pinterest --> */}
  <meta property="og:url" content="${href}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${articleTitle}">
  <meta property="og:description" content="${article?.meta_description}">
  <meta property="og:image" content="${article?.featured_image}">
  <meta property="og:site_name" content="${host}" />

  {/* <!-- Twitter --> */}
  <meta name="twitter:card" content="summary_large_image">
  <meta property="twitter:domain" content="${host}">
  <meta property="twitter:url" content="${href}">
  <meta name="twitter:title" content="${articleTitle}">
  <meta name="twitter:description" content="${article?.meta_description}">
  <meta name="twitter:image" content="${article?.featured_image}">

  <script type="application/ld+json">
${JSON.stringify(article?.schema_markups ?? {})}
</script>
<head>
<body>
<h1>${article.title ?? ""}</h1>
${article.html}
</body>
</html>
`;

    return getSEOChecks({ html, keywords: article.keywords ?? [], url: href })
  }, [project, article]);

  const onSaveForm = async (values: any) => {
    await updateBlogPost.mutateAsync({
      ...values,
      id: article.id,
    })
    queryClient.invalidateQueries({
      queryKey: queryKeys.blogPosts(projectId)
    });
    message.success("Change saved.")
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

  const schemaMarkup = prettify(`
    <script type="application/ld+json">
    ${JSON.stringify(article?.schema_markups ?? {})}
    </script>
    `)

  const onCopySchemaMarkup = () => {
    navigator.clipboard.writeText(schemaMarkup);
    message.success("Copied to clipboard!");
  }

  const onChangeTitle = (e: any) => {
    const value = e.target.textContent;
    setArticleTitle(value)
    seoForm.setFieldValue("slug", slugify(value));
    updateBlogPost.mutate({
      id: articleId,
      title: value,
    })
  }

  const sendFeedback = (emoji: string) => {
    if (window.$crisp && ["😡", "😕"].includes(emoji)) {
      $crisp.push(["set", "message:text", [`Reaction: ${emoji}\nID: ${articleId}\nFeedback: `]]);
      $crisp.push(['do', 'chat:open']);
      return;
    } else {
      message.success('Thanks for your feedback');
    }
  }

  const renderCheckIcon = (value?: boolean) => {
    return value ? <IconCircleCheckFilled className='text-green-500' /> : <IconCircleXFilled className='text-red-500' />
  }

  if (isError) return null;

  return (
    <div>

      <AddMediaModal
        open={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        disableYoutube
        onSubmit={(image) => {
          featuredImageForm.setFieldValue("featured_image", image.src)
        }}
      />

      <Flex vertical gap="large">
        <div className='flex flex-row justify-between'>
          <div className='w-[655px] mx-auto'>
            <div className='flex flex-row justify-between mb-4'>
              <Button
                onClick={() => router.replace(`/projects/${projectId}?tab=blog-posts`)}
                icon={<ArrowLeftOutlined />}
                className='w-fit'
              >
                Back
              </Button>

              <PublishBlogPostButton id={articleId} />
            </div>
            <Spin spinning={article?.status === "writing"} tip="Your content is writing">
              <div>
                {!article ? (
                  <Skeleton active loading />
                ) : (
                  <>
                    <div
                      placeholder='Add title'
                      className='text-4xl font-extrabold w-full border-none outline-none mb-8'
                      contentEditable
                      onInput={debounce(onChangeTitle, 1500)}
                    >
                      {articleTitle}
                    </div>
                    <div>
                      <div id="editor-container">
                        <div>
                          <TiptapEditor
                            articleId={articleId}
                            content={`${article?.html}` ?? ""}
                            readOnly={false}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Spin>
          </div>

          <div className='flex flex-col gap-4 w-[35%]'>
            <div>
              <div className='flex flex-col gap-1'>
                <p>Do you like this article?</p>
                <div className='flex flex-row gap-3 border rounded-full p-2 w-fit shadow-lg bg-white'>
                  <span onClick={() => sendFeedback("😡")} className='cursor-pointer text-4xl hover:scale-150 transition-all'>😡</span>
                  <span onClick={() => sendFeedback("😕")} className='cursor-pointer text-4xl hover:scale-150 transition-all'>😕</span>
                  <span onClick={() => sendFeedback("😄")} className='cursor-pointer text-4xl hover:scale-150 transition-all'>😄</span>
                  <span onClick={() => sendFeedback("😍")} className='cursor-pointer text-4xl hover:scale-150 transition-all'>😍</span>
                </div>
              </div>
            </div>

            <div className='flex flex-row justify-between'>
              <p className='font-bold text-2xl'>Checklist</p>
            </div>
            <div className='flex flex-col items-start'>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.meta.description)}
                title="Article url"
              >
                <Form
                  initialValues={{
                    slug: slugify(article?.title ?? "")
                  }}
                  onFinish={onSaveForm}
                >
                  <Form.Item style={{ marginBottom: 12 }} name="slug" rules={[{ required: true, type: "string", message: "Add a slug" }]}>
                    <Input addonBefore={getBlogUrl()} placeholder='article-slug-here' />
                  </Form.Item>
                  <Form.Item className="flex justify-end">
                    <Button type='primary' htmlType="submit">Save</Button>
                  </Form.Item>
                </Form>
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.meta.description)}
                title="Description"
              >
                <Form
                  initialValues={{
                    meta_description: seoChecks?.meta.description ?? ""
                  }}
                  onFinish={onSaveForm}
                >
                  <Form.Item
                    name="meta_description"
                    help="160 characters max recommended"
                    rules={[{ required: false, type: "string", message: "Add a meta description" }]}
                  >
                    <Input.TextArea placeholder='Add a meta description' rows={4} />
                  </Form.Item>
                  <Form.Item className="flex justify-end">
                    <Button type='primary' htmlType="submit">Save</Button>
                  </Form.Item>
                </Form>
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.meta.keywords?.length)}
                title="Keywords"
              >
                <Form
                  initialValues={{
                    keywords: article.keywords ? article.keywords.join(',') ?? "" : "",
                  }}
                  onFinish={(values) => {
                    onSaveForm({
                      keywords: values.keywords.split(",")
                    })
                  }}
                >
                  <Form.Item name="keywords" help="Separate the keywords with a comma" rules={[{ required: false, type: "string", message: "Add keywords" }]}>
                    <Input.TextArea rows={5} placeholder='Add keywords' />
                  </Form.Item>
                  <Form.Item className="flex justify-end">
                    <Button type='primary' htmlType="submit">Save</Button>
                  </Form.Item>
                </Form>
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.headings.h1.length && !seoChecks?.headings.multipleH1)}
                title={(
                  <div className='flex gap-2'>
                    <p>H1</p>
                    {seoChecks?.headings.multipleH1 && <Tag color="error" className='text-sm'>You have more than 1 H1</Tag>}
                  </div>
                )}
              >
                {seoChecks?.headings.h1.length ? seoChecks?.headings.h1.map((h1, index) => (
                  <div key={index} className='flex items-start gap-2'>
                    <p>{h1}</p>
                  </div>
                )) : (
                  <p>You have no H1</p>
                )}
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.headings.h2.length)}
                title={(
                  <p>H2 <b>({seoChecks?.headings.h2.length})</b></p>
                )}
              >
                {seoChecks?.headings.h2.length ? seoChecks?.headings.h2.map((h2, index) => (
                  <div key={index} className='flex items-start gap-2'>
                    <p>{h2}</p>
                  </div>
                )) : (
                  <p>You have no H2</p>
                )}
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.headings.h3.length)}
                title={(
                  <p>H3 <b>({seoChecks?.headings.h3.length})</b></p>
                )}
              >
                {seoChecks?.headings.h3.length ? seoChecks?.headings.h3.map((h3, index) => (
                  <div key={index} className='flex items-start gap-2'>
                    <p>{h3}</p>
                  </div>
                )) : (
                  <p>You have no H3</p>
                )}
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.headings.h4.length)}
                title={(
                  <p>H4 <b>({seoChecks?.headings.h4.length})</b></p>
                )}
              >
                {seoChecks?.headings.h4.length ? seoChecks?.headings.h4.map((h4, index) => (
                  <div key={index} className='flex items-start gap-2'>
                    <p>{h4}</p>
                  </div>
                )) : (
                  <p>You have no H4</p>
                )}
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.meta.featuredImage)}
                title={<p>Featured Image</p>}
              >
                <Form
                  form={featuredImageForm}
                  initialValues={{
                    featured_image: seoChecks?.meta.featuredImage ?? "",
                  }}
                  onFinish={(values) => {
                    onSaveForm({
                      ...values,
                      og_image_url: values.featured_image
                    })
                  }}
                >
                  <Spin spinning={isUpdatingFeaturedImage}>
                    <Form.Item style={{ marginBottom: 12 }} name="featured_image" rules={[{ required: false, type: "url", message: "Add a valid url" }]}>
                      <Input placeholder='https://google.com/image-url' disabled={isUpdatingFeaturedImage} />
                    </Form.Item>

                    <div className="flex flex-col gap-2">
                      {/* {ogImageUrl && (
                    <img src={ogImageUrl} className="w-[150px] aspect-square object-cover rounded-lg" />
                  )} */}
                      <Image src={ogImageUrl} preview={false} className='rounded-lg' />

                      <div className="flex flex-row justify-end gap-2">
                        <Button
                          onClick={() => {
                            try {
                              setIsUpdatingFeaturedImage(true)
                              const $ = cheerio.load(article.html);
                              const firstImageInArticle = $('img').first().attr('src') ?? "";
                              featuredImageForm.setFieldValue("featured_image", firstImageInArticle)
                              setIsUpdatingFeaturedImage(false)
                            } catch {
                              setIsUpdatingFeaturedImage(false)
                            }
                          }}
                          className="w-fit"
                        >
                          Use 1st image in content
                        </Button>
                        <Button className="w-fit" onClick={() => setIsImageModalOpen(true)} icon={<SearchOutlined />}>
                          Search image
                        </Button>
                        <Button type="primary" htmlType="submit">
                          Save
                        </Button>
                      </div>

                      {ogImageUrl && (
                        <div className="flex flex-col gap-4">
                          <Flex vertical gap="small">
                            <IconBrandGoogle />
                            <div>
                              <Link href="" className={styles.google.title}>
                                {article.title}
                              </Link>
                              <Flex>
                                <Typography.Text className={styles.google.url}>{getPreviewUrl("href")}</Typography.Text>
                                <CaretDownOutlined className={styles.google.arrow} />
                              </Flex>
                              <Typography.Text className={styles.google.description}>{article.meta_description}</Typography.Text>
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
                        </div>
                      )}
                    </div>
                  </Spin>
                </Form>
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.images.total)}
                title={<p>Images <b>({seoChecks?.images.total})</b></p>}
              >
                <div className='flex flex-row flex-wrap gap-2'>
                  {seoChecks?.images.list.map((item, index) => {
                    return (
                      <div key={index} className='flex flex-col items-center gap-2'>
                        <Image src={item.url} preview={false} className="w-[150px] aspect-square object-cover rounded-lg" />
                        {!item.hasAlt && <Tag color="error" className='text-sm'>Missing Alt attribute</Tag>}
                      </div>
                    )
                  })}
                </div>
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.videos.total)}
                title={<p>Videos <b>({seoChecks?.videos.total})</b></p>}
              >
                {!!seoChecks?.videos.list.length ? seoChecks?.videos.list.map((item, index) => {
                  return (
                    <div key={index} className='flex items-start gap-2'>
                      <p>{item}</p>
                    </div>
                  )
                }) : (
                  <p>You have no videos</p>
                )}
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.links.internal.list)}
                title={(
                  <p>Internal links <b>({seoChecks?.links.internal.total})</b></p>
                )}
              >
                {seoChecks?.links.internal.total ? seoChecks?.links.internal.list.map((item, index) => (
                  <div key={index} className='flex items-start gap-2'>
                    <p>{item}</p>
                  </div>
                )) : (
                  <p>You have no internal links</p>
                )}
              </Collapse>

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.links.external.list)}
                title={(
                  <p>External links <b>({seoChecks?.links.external.total})</b></p>
                )}
              >
                {seoChecks?.links.external.total ? seoChecks?.links.external.list.map((item, index) => (
                  <div key={index} className='flex items-start gap-2'>
                    <p>{item}</p>
                  </div>
                )) : (
                  <p>You have no external links</p>
                )}
              </Collapse>

              {/*
              <Collapse
                isChecked={renderCheckIcon(seoChecks?.keywords.inSlug)}
                title={<p>Keywords in Slug</p>}
              >
                <Form>
                  <Form.Item style={{ marginBottom: 12 }} name="slug" rules={[{ required: true, type: "string", message: "Add a slug" }]}>
                    <Input addonBefore={getBlogUrl()} placeholder='article-slug-here' />
                  </Form.Item>
                  <Form.Item className="flex justify-end">
                    <Button type='primary'>Save</Button>
                  </Form.Item>
                </Form>
              </Collapse> */}
              {/*
              <Collapse
                isChecked={renderCheckIcon(!seoChecks?.meta.description)}
                title="Meta description"
              >
                <Form
                  initialValues={{
                    meta_description: seoChecks?.meta.description ?? ""
                  }}
                >
                  <Form.Item
                    style={{ marginBottom: 28 }}
                    name="meta_description"
                    help="160 characters max recommended"
                    rules={[{ required: false, type: "string", message: "Add a meta description" }]}
                  >
                    <Input placeholder='Add a meta description' />
                  </Form.Item>
                  <Form.Item className="flex justify-end">
                    <Button type='primary'>Save</Button>
                  </Form.Item>
                </Form>
              </Collapse> */}
              {/*
              <Collapse
                isChecked={renderCheckIcon(seoChecks?.keywords.inMetaDescription)}
                title={<p>Keywords in Meta Description</p>}
              >
                <p>{seoChecks?.keywords.inMetaDescription ? 'Yes' : 'No'}</p>
                <Form>
                  <Form.Item
                    style={{ marginBottom: 28 }}
                    name="meta_description"
                    help="160 characters max recommended"
                    rules={[{ required: false, type: "string", message: "Add a meta description" }]}
                  >
                    <Input placeholder='Add a meta description' />
                  </Form.Item>
                  <Form.Item className="flex justify-end">
                    <Button type='primary'>Save</Button>
                  </Form.Item>
                </Form>
              </Collapse> */}

              <Collapse
                isChecked={renderCheckIcon(!!seoChecks?.structuredData?.length)}
                title={<p>Structured data <b>({Object.keys(article?.schema_markups ?? {}).length})</b></p>}
              >
                <div className="flex flex-col gap-4">
                  <Label name="Click to generate structured data" />
                  <div className='grid grid-cols-3 gap-2'>
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
                  </div>

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
              </Collapse>
            </div>
          </div>
        </div>
      </Flex>

      {/* <ExportBlogPostDrawer
        open={drawers.exportBlogPost.isOpen}
        onClose={() => drawers.openExportBlogPostDrawer({ isOpen: false })}
        articleId={articleId}
      /> */}
    </div>
  )
}

export default Article;
