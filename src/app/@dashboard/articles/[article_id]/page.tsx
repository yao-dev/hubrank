'use client';
import { Button, Drawer, Flex, Grid, SimpleGrid, Skeleton, Tabs, Title } from '@mantine/core';
import HtmlHeadTagsForm from '@/components/HtmlHeadTagsForm/HtmlHeadTagsForm';
import useHtmlTagsForm from '@/hooks/useHtmlTagsForm';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useBlogPosts from '@/hooks/useBlogPosts';
import { FacebookPreviews, GoogleSearchPreview } from '@automattic/social-previews';
import supabase from '@/helpers/supabase';

const ArticleDetail = ({
  params,
}: {
  params: { article_id: number }
}) => {
  const articleId = +params.article_id;
  console.log('articleId', articleId)
  const {
    data: article,
    isLoading,
    isError
  } = useBlogPosts().getOne(articleId)
  const form = useHtmlTagsForm();
  const [opened, { open, close }] = useDisclosure(false);
  const metatagsForm = useHtmlTagsForm();
  const [markdown, setMarkdown] = useState<string>("");
  const [editable, setEditable] = useState(true);
  const editorRef = useRef(null);

  useEffect(() => {
    console.log(editorRef.current);
    // editorRef.current.activeEditor.plugins.export.convert('clientpdf', {}).then((res) => {
    //   console.log(res)
    // })
  }, []);

  const onRetry = async () => {
    await supabase.from('blog_posts_headings').delete().eq("blog_post_id", article.id).throwOnError();
    await supabase.from('blog_posts').update({ status: "writing" }).eq("id", article.id).throwOnError();
    await supabase.from('blog_posts_headings').insert(article.headings.map((h: any, hIdx: any) => {
      return {
        blog_post_id: article.id,
        heading: h.heading,
        words_count: h.words_count,
        media: h.media,
        call_to_action: h.call_to_action,
        call_to_action_instruction: h.call_to_action_instruction,
        keywords: h.keywords,
        external_links: h.external_links,
        order: hIdx,
      }
    }))
      .throwOnError();
  }

  return (
    <div>
      <Drawer opened={opened} onClose={close} title="SEO settings" size="lg">
        <HtmlHeadTagsForm form={form} />
      </Drawer>
      {/*
      <div>
        <Flex direction="row" align="center" justify="space-between" gap="sm" mb="xl">
          <MyBreadcrumbs />
          <Flex direction="row" align="center" gap="sm">
            <ActionIcon onClick={open} variant="transparent"><IconSettings size="1.5rem" /></ActionIcon>
          </Flex>
        </Flex>
        <Title order={3} mb="xl">Edit article</Title>
        <Title order={3} mt="xl" mb="sm" w="75%">{article.title}</Title>
        <Flex direction="row" gap="xs" mt="xs" mb="xl">
          <Badge size="xs" color="grape">Words: {article.word_count || 0}</Badge>
          {article.content_type && <Badge size="xs" color="violet">{article.content_type}</Badge>}
          {article.purpose && <Badge size="xs" color="pink">{article.purpose}</Badge>}
        </Flex>
      </div> */}

      <Tabs
        defaultValue="edit"
        // onChange={(value) => setHash(value)}
        // variant="pills"
        // style={{ marginTop: 32 }}
        keepMounted={false}
      // mt="xl"
      >
        <Tabs.List>
          <Tabs.Tab
            value="edit"
          // leftSection={<IconCursorText />}
          >
            Article
          </Tabs.Tab>
          <Tabs.Tab
            value="seo"
          // leftSection={<IconSettings />}
          >
            Meta tags
          </Tabs.Tab>
          <Tabs.Tab
            value="schema"
          // leftSection={<IconSettings />}
          >
            Schema markup
          </Tabs.Tab>
          <Tabs.Tab
            value="export"
          // leftSection={<IconDownload />}
          >
            Export
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="edit" pt="sm">
          <Grid>
            <Grid.Col span={8}>
              {isLoading && [...Array(150).keys()].map((_, index) => {
                return <Skeleton key={index} height={5} mb={4} />
              })}

              {!isError && !isLoading && article && (
                <>
                  <Button onClick={onRetry} variant="light">retry</Button>
                  <Editor
                    ref={editorRef}
                    onInit={(evt, ref) => editorRef.current = ref}
                    apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'
                    init={{
                      height: '90dvh',
                      menubar: false,
                      // plugins: 'ai tinycomments mentions anchor autolink codesample emoticons image link lists media searchreplace table wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
                      plugins: 'export wordcount ai tinymcespellchecker autocorrect a11ychecker typography inlinecss',
                      // toolbar: 'export | undo redo | blocks fontfamily fontsize | bold italic underline strikethrough removeformat | link image media table | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons wordcount',
                      tinycomments_mode: 'embedded',
                      tinycomments_author: 'Author name',
                      ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
                    }}
                    initialValue={article.html}
                  />
                </>
              )}

            </Grid.Col>
          </Grid>
        </Tabs.Panel>
        <Tabs.Panel value="seo" pt="sm">
          <SimpleGrid cols={2}>
            <HtmlHeadTagsForm form={metatagsForm} />
            {/* <MetatagsPreview values={metatagsForm.values} /> */}
            <div>
              <Title order={3} mb="md">Sharing preview</Title>
              <Flex direction="column" mb="lg">
                <Title order={4}>Facebook</Title>
                <FacebookPreviews
                  title="Five for the Future"
                  description="Launched in 2014, Five for the Future encourages organizations to contribute five percent of their resources to WordPress development. WordPress co-founder Matt Mullenweg proposed this benchmark to maintain a “golden ratio” of contributors to users."
                  url="https://mealful.app"
                  user={{ displayName: 'Michael Yao' }}
                />
              </Flex>
              <Flex direction="column" mb="lg">
                <Title order={4}>Google</Title>
                <GoogleSearchPreview
                  title="Five for the Future"
                  description="Launched in 2014, Five for the Future encourages organizations to contribute five percent of their resources to WordPress development. WordPress co-founder Matt Mullenweg proposed this benchmark to maintain a “golden ratio” of contributors to users."
                  url="https://mealful.app"
                  siteTitle="Five for the Future"
                />
              </Flex>
              {/* <Flex direction="column" mb="lg">
                <Title order={4}>Linkedin</Title>
                <LinkedInPreviews
                  jobTitle="Job Title (Company Name)"
                  image="https://url.for.the/image.png"
                  name="LinkedIn Account Name"
                  profileImage="https://static.licdn.com/sc/h/1c5u578iilxfi4m4dvc4q810q"
                  title="Post title goes here"
                  text="The text of the post goes here."
                />
              </Flex> */}
            </div>
          </SimpleGrid>
        </Tabs.Panel>
        <Tabs.Panel value="schema" pt="sm">
        </Tabs.Panel>
        <Tabs.Panel value="export" pt="sm">
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default ArticleDetail;