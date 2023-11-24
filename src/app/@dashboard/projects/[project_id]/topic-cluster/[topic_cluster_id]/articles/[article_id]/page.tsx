'use client';
// import "@blocknote/core/style.css";
// import "./styles.css";
import { ActionIcon, Drawer, Flex } from '@mantine/core';
import { IconSettings } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import useArticles from '@/hooks/useArticles';
import HtmlHeadTagsForm from '@/components/HtmlHeadTagsForm/HtmlHeadTagsForm';
import useHtmlTagsForm from '@/hooks/useHtmlTagsForm';
import { useDisclosure } from '@mantine/hooks';
// import {
//   BlockNoteView,
//   FormattingToolbarPositioner,
//   HyperlinkToolbarPositioner,
//   ImageToolbarPositioner,
//   SideMenuPositioner,
//   SlashMenuPositioner,
//   useBlockNote,
// } from "@blocknote/react";
import { useEffect, useRef, useState } from 'react';
import MyBreadcrumbs from "@/components/MyBreadcrumbs/MyBreadcrumbs";
import { Editor } from '@tinymce/tinymce-react';

const ArticleDetail = ({
  params,
}: {
  params: { article_id: number }
}) => {
  const articleId = +params.article_id;
  const router = useRouter()
  const {
    data: article,
    isLoading,
    isError
  } = useArticles().getOne(articleId)
  const form = useHtmlTagsForm();
  const [opened, { open, close }] = useDisclosure(false);
  const metatagsForm = useHtmlTagsForm();
  const [markdown, setMarkdown] = useState<string>("");
  const [editable, setEditable] = useState(true);
  const editorRef = useRef(null);
  // const aiCommands = useAiCommands(setEditable)

  // const customSlashMenuItemList = [
  //   ...aiCommands,
  //   ...getDefaultReactSlashMenuItems(),
  // ];


  // Creates a new editor instance.
  // const editor: BlockNoteEditor = useBlockNote({
  //   editable,
  //   // slashMenuItems: customSlashMenuItemList,
  //   onEditorContentChange: (editor) => {
  //     const saveBlocksAsMarkdown = async () => {
  //       const markdown: string =
  //         await editor.blocksToMarkdown(editor.topLevelBlocks);
  //       setMarkdown(markdown);
  //     };
  //     saveBlocksAsMarkdown();
  //   },
  //   async uploadFile(file) {
  //     console.log('uploadFile', file)
  //     return ''
  //   },
  // });


  // useEffect(() => {
  //   if (article?.content_html && editor) {
  //     const getBlocks = async () => {
  //       const blocks: Block[] = await editor.HTMLToBlocks(article?.content_html);
  //       editor.replaceBlocks(editor.topLevelBlocks, blocks);
  //     };
  //     getBlocks();
  //   }
  // }, [article, editor])

  // useEffect(() => {
  //   if (article) {
  //     editor?.commands.setContent(article?.content_html)
  //     form.setFieldValue('title', article.title)
  //   }
  // }, [article])

  // const addImage = useCallback((obj) => {
  //   console.log(obj)
  //   console.log(URL.createObjectURL(obj))

  //   if (editor) {
  //     editor.chain().focus().setImage({ src: URL.createObjectURL(obj) }).run()
  //   }
  // }, [])

  useEffect(() => {
    console.log(editorRef.current)
  }, [])

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
        <Flex direction="row" align="center" justify="space-between" gap="sm" mb="xl">
          <MyBreadcrumbs />
          {/* Header menu / settings */}
          <Flex direction="row" align="center" gap="sm">
            <ActionIcon onClick={open} variant="transparent"><IconSettings size="1.5rem" /></ActionIcon>
          </Flex>
        </Flex>
        {/* <Title order={3} mt="xl" mb="sm" w="75%">{article.title}</Title>
        <Flex direction="row" gap="xs" mt="xs" mb="xl">
          <Badge size="xs" color="grape">Words: {article.word_count || 0}</Badge>
          {article.content_type && <Badge size="xs" color="violet">{article.content_type}</Badge>}
          {article.purpose && <Badge size="xs" color="pink">{article.purpose}</Badge>}
        </Flex> */}
      </div>
      {/*
      <Editor
        apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue="<p>This is the initial content of the editor.</p>"
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
        }}
      /> */}

      {article && <Editor
        apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'
        onInit={(evt, editor) => editorRef.current = editor}
        init={{
          height: '100dvh',
          // menubar: false,
          // plugins: 'ai tinycomments mentions anchor autolink codesample emoticons image link lists media searchreplace table wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss',
          plugins: 'export wordcount ai tableofcontents tinymcespellchecker autocorrect a11ychecker typography inlinecss',
          toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough removeformat | link image media table | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons',
          tinycomments_mode: 'embedded',
          tinycomments_author: 'Author name',
          ai_request: (request, respondWith) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
        }}
        initialValue={article.content_html}
      />}

      {/* <div className={styles.content}>
        <BlockNoteView editor={editor} theme="light">
          <FormattingToolbarPositioner editor={editor} />
          <HyperlinkToolbarPositioner editor={editor} />
          <SlashMenuPositioner editor={editor} />
          <SideMenuPositioner editor={editor} />
          <ImageToolbarPositioner editor={editor} />
        </BlockNoteView>
      </div>


      {/* <Tabs
        defaultValue="edit"
        // onChange={(value) => setHash(value)}
        variant="pills"
        // style={{ marginTop: 32 }}
        keepMounted={false}
        mt="xl"
      >
        <Tabs.List>
          <Tabs.Tab
            value="edit"
            leftSection={<IconCursorText />}
          >
            Edit
          </Tabs.Tab>
          <Tabs.Tab
            value="seo"
            leftSection={<IconSettings />}
          >
            SEO
          </Tabs.Tab>
          <Tabs.Tab
            value="export"
            leftSection={<IconDownload />}
          >
            Export
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="edit" pt="xl">
          <Grid>
            <Grid.Col span={8}>
              <BlockNoteView editor={editor} theme="light" style={{ color: 'black' }} />
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
        <Tabs.Panel value="seo" pt="xl">
          <SimpleGrid cols={2}>
            <HtmlHeadTagsForm form={metatagsForm} />
            <MetatagsPreview values={metatagsForm.values} />
          </SimpleGrid>
        </Tabs.Panel>
        <Tabs.Panel value="export" pt="xl">
        </Tabs.Panel>
      </Tabs> */}
    </div>
  )
}

export default ArticleDetail;