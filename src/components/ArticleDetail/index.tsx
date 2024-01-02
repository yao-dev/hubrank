'use client';
import { Affix, Button, Drawer, Flex, Group, Stepper, Text, Box } from '@mantine/core';
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import useBlogPosts from '@/hooks/useBlogPosts';
import { IconArrowLeft, IconDownload } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useDisclosure } from '@mantine/hooks';
import HtmlHeadTagsForm from '../HtmlHeadTagsForm/HtmlHeadTagsForm';
import useHtmlTagsForm from '@/hooks/useHtmlTagsForm';
import MetatagsPreview from '../MetatagsPreview/MetatagsPreview';
import SeoTagsContext from '@/context/SeoTagsContext';
import * as cheerio from "cheerio";

const ExportArticleForm = () => {
  const [active, setActive] = useState(0);
  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <>
      <Stepper size="sm" active={active} onStepClick={setActive}>
        <Stepper.Step label="SEO tags">
          <HtmlHeadTagsForm />
        </Stepper.Step>
        <Stepper.Step label="Preview">
          <MetatagsPreview />
        </Stepper.Step>
        {/* <Stepper.Completed>
          <MetatagsPreview values={form} />
        </Stepper.Completed> */}
      </Stepper>

      <Group align="end" justify="end" mt="xl">
        <Button variant="default" onClick={prevStep}>Back</Button>
        <Button onClick={nextStep}>Next step</Button>
      </Group>
    </>
  )
}

const ArticleDetail = ({ id }: { id: number | string }) => {
  const { getOne, update } = useBlogPosts();
  const {
    data: article,
    isLoading,
    isError
  } = getOne(+id)
  const editorRef = useRef(null);
  const html = useRef("");
  const router = useRouter();
  const [opened, { open, close }] = useDisclosure(false);
  const form = useHtmlTagsForm();
  const [isSaved, setIsSaved] = useState(true);
  // const activeProjectId = useActiveProject().id;
  // const { data: project } = useProjects().getOne(activeProjectId)

  // const onRetry = async () => {
  //   const user_id = await getUserId();
  //   await supabase.from('blog_posts_headings').delete().eq("blog_post_id", article.id).throwOnError();
  //   await supabase.from('blog_posts').update({ status: "writing" }).eq("id", article.id);
  //   await supabase.from('blog_posts_headings').insert(article.headings.map((h: any, hIdx: any) => {
  //     return {
  //       blog_post_id: article.id,
  //       heading: h.heading,
  //       words_count: h.words_count,
  //       media: h.media,
  //       call_to_action: h.call_to_action,
  //       call_to_action_instruction: h.call_to_action_instruction,
  //       keywords: h.keywords,
  //       external_links: h.external_links,
  //       order: hIdx,
  //       user_id,
  //     }
  //   }))
  // }

  const onSaveEditor = async (content: string) => {
    const $ = cheerio.load(content);
    const firstNonEmptyH1 = $('h1').filter((index, element) => $(element).text().trim() !== '').first();
    const firstNonEmptyH1Content = firstNonEmptyH1.text();
    const headline = article.headline || "";
    const title = firstNonEmptyH1Content || headline;

    form.setValues({
      title: firstNonEmptyH1Content || headline,
      // og_title: headline,
      // twitter_title: headline,
      description: "",
      og_description: "",
      twitter_description: "",
      html: content
    });

    const updateObject: any = { id: article.id, html: content }

    if (title) {
      updateObject.headline = title;
    }

    await update.mutateAsync(updateObject);
    setIsSaved(true)
  }

  return (
    <SeoTagsContext.Provider value={{ form }}>
      <div>
        {article && (
          <Drawer
            opened={opened}
            onClose={close}
            size="40rem"
            withCloseButton
            position="right"
            title="Export"
          // title={<Title order={4}>Export</Title>}
          // scrollAreaComponent={ScrollArea.Autosize}
          >
            <ExportArticleForm />
          </Drawer>
        )}

        <Box w="48rem">
          <Flex justify="space-between" align="center" mb="md">
            <Flex align="center" style={{ cursor: "pointer" }} onClick={() => router.back()} gap="xs">
              <IconArrowLeft size={26} />
              <Text size="md">Back</Text>
            </Flex>
            <Flex gap="sm">
              <Button onClick={open} rightSection={<IconDownload />}>Export</Button>
            </Flex>
          </Flex>

          {!isError && !isLoading && article && (
            <>
              <Editor
                ref={editorRef}
                onInit={(evt, ref) => {
                  html.current = ref.startContent
                  onSaveEditor(html.current);
                }}
                apiKey='nxfnn8l3r29y3xnokhfghz70vvqj5b8uut5pcyp3i8scsjhx'

                // setup={ (editor) => {
                //   editor.on('change', (e) => {
                //     $.ajax({
                //       type: 'POST',
                //       url: 'php/save.php',
                //       data: {
                //         editor: tinymce.get('editor').getContent()
                //       },
                //       success: function(data){
                //         $('#editor').val('');
                //         console.log(data)
                //       }
                //     })
                //   })
                // }}
                init={{
                  height: '80dvh',
                  // width: '50dvw',
                  menubar: false,
                  plugins: undefined,
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
                  setIsSaved(editorRef.current?.editor?.isNotDirty)
                }}
              />
            </>
          )}
        </Box>

        <Affix hidden={opened} position={{ right: 0, bottom: 0, left: 300 }} style={{ background: "#FFF", borderTop: '1px solid #dee2e6' }}>
          <Flex
            align="center"
            justify="end"
            p="md"
            gap="md"
          >
            <Button disabled={isSaved} onClick={() => onSaveEditor(html.current)}>Save</Button>
          </Flex>
        </Affix>
      </div>
    </SeoTagsContext.Provider>
  )
}

export default ArticleDetail;