'use client'

import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { ActionIcon, Badge, Drawer, Flex, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import useArticles from '@/hooks/useArticles';
import { useEffect } from 'react';
import HtmlHeadTagsForm from '@/components/HtmlHeadTagsForm/HtmlHeadTagsForm';
import useHtmlTagsForm from '@/hooks/useHtmlTagsForm';
import { useDisclosure } from '@mantine/hooks';

const ArticleDetail = ({
  params,
}: {
  params: { article_id: number }
}) => {
  const articleId = params.article_id;
  const router = useRouter()
  const {
    data: article,
    isLoading,
    isError
  } = useArticles().getOne(articleId)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: article?.content_html || "",
  });
  const form = useHtmlTagsForm();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    if (article) {
      editor?.commands.setContent(article?.content_html)
    }
  }, [article])

  useEffect(() => {
    if (article) {
      form.setFieldValue('title', article.title)
    }
  }, [article, form])

  if (isError) {
    return null;
  }

  if (isLoading) {
    // TODO: show skeleton
    return null;
  }


  return (
    <div>
      <Drawer opened={opened} onClose={close} title="SEO settings" size="lg">
        <HtmlHeadTagsForm form={form} />
      </Drawer>
      <div>
        <Flex direction="row" align="center" justify="space-between" gap="sm">
          <IconArrowLeft onClick={() => router.back()} style={{ cursor: 'pointer' }} />
          {/* <Text>projects</Text> */}
          {/* Header menu / settings */}
          <Flex direction="row" align="center" gap="sm">
            <ActionIcon onClick={open} variant="transparent"><IconSettings size="1.5rem" /></ActionIcon>
          </Flex>
        </Flex>
        <Title order={1} mt="xl" mb="sm" w="75%">{article.title}</Title>
        <Flex direction="row" gap="xs" mb="xl">
          <Badge color="grape">Words: {article.word_count || 0}</Badge>
          {article.content_type && <Badge color="violet">{article.content_type}</Badge>}
          {article.purpose && <Badge color="pink">{article.purpose}</Badge>}
        </Flex>
      </div>
      <RichTextEditor editor={editor}>
        <RichTextEditor.Toolbar>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
            <RichTextEditor.Strikethrough />
            <RichTextEditor.ClearFormatting />
            <RichTextEditor.Highlight />
            <RichTextEditor.Code />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.H1 />
            <RichTextEditor.H2 />
            <RichTextEditor.H3 />
            <RichTextEditor.H4 />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Blockquote />
            <RichTextEditor.Hr />
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Subscript />
            <RichTextEditor.Superscript />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link />
            <RichTextEditor.Unlink />
          </RichTextEditor.ControlsGroup>

          <RichTextEditor.ControlsGroup>
            <RichTextEditor.AlignLeft />
            <RichTextEditor.AlignCenter />
            <RichTextEditor.AlignJustify />
            <RichTextEditor.AlignRight />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>

        <RichTextEditor.Content />
      </RichTextEditor>
    </div >
  )
}

export default ArticleDetail;