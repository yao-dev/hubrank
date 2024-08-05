'use client';;
import { useEffect, useState } from 'react';
import useBlogPosts from '@/hooks/useBlogPosts';
import { Button, Flex, Form, message, Skeleton, Spin } from 'antd';
import { useRouter } from 'next/navigation';
// import "./styles.css";
import useProjects from '@/hooks/useProjects';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';
import ExportBlogPostDrawer from '@/components/ExportBlogPostDrawer/ExportBlogPostDrawer';
import useDrawers from '@/hooks/useDrawers';
import { debounce } from 'lodash';
import MDEditor from './MDEditor/MDEditor';
import { IconSparkles } from '@tabler/icons-react';
// import { FacebookSelector } from 'react-reactions';

const slugify = (text: string) =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');

function calculateOffset(container, offset) {
  // Traverses the DOM to calculate the position within the text
  let position = 0;
  const walker = document.createTreeWalker(container.parentNode, NodeFilter.SHOW_TEXT, null, false);
  let currentNode;

  while (currentNode = walker.nextNode()) {
    if (currentNode === container) {
      position += offset;
      break;
    } else {
      position += currentNode.textContent.length;
    }
  }

  return position;
}

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
  const [selection, setSelection] = useState({
    text: "",
    cursorX: null,
    cursorY: null,
  })
  const [seoForm] = Form.useForm();
  const drawers = useDrawers();

  useEffect(() => {
    if (article) {
      setMarkdown(article.markdown)
      setStats(article.markdown);
      setArticleTitle(article?.title ?? "")
    }
  }, [article]);

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
    if ($crisp && ["😡", "😕"].includes(emoji)) {
      $crisp.push(["set", "message:text", [`Reaction: ${emoji}\nID: ${articleId}\nFeedback: `]]);
      $crisp.push(['do', 'chat:open']);
      return;
    } else {
      message.success('Thanks for your feedback');
    }
  }

  const getBlogUrl = () => {
    if (!project) return "";
    return new URL(`${project.blog_path}`, new URL(project.website).href).href
  }

  // useEffect(() => {
  //   const mouseUpHandler = (event: any) => {
  //     const editorContainer = document.getElementById("editor-container");
  //     const aiEditor = document.getElementById("ai-editor");

  //     if (aiEditor?.contains(document.activeElement) || aiEditor?.contains(window?.getSelection?.().anchorNode)) {
  //       return;
  //     } else {
  //       setSelection({
  //         text: "",
  //         cursorX: null,
  //         cursorY: null,
  //       })
  //     }

  //     if (editorContainer?.contains(document.activeElement) || editorContainer?.contains(window?.getSelection?.().anchorNode)) {
  //       const windowSelection = window.getSelection()
  //       const selectedText = windowSelection?.toString() ?? ""

  //       if (selectedText) {
  //         // console.log(windowSelection)
  //         // setSelection({
  //         //   text: selectedText,
  //         //   cursorX: event.pageX,
  //         //   cursorY: event.pageY,
  //         //   anchorOffset: windowSelection?.anchorOffset,
  //         //   extentOffset: windowSelection?.extentOffset,
  //         //   focusOffset: windowSelection?.anchorOffset,
  //         // });

  //         if (windowSelection?.rangeCount > 0) {
  //           const range = windowSelection.getRangeAt(0);
  //           const startContainer = range.startContainer;
  //           const endContainer = range.endContainer;
  //           const startOffset = range.startOffset;
  //           const endOffset = range.endOffset;

  //           // Get full text from the selected node
  //           const fullText = [startContainer.textContent, endContainer.textContent].join('\n');

  //           // Calculate positions
  //           const startPosition = calculateOffset(startContainer, startOffset);
  //           const endPosition = calculateOffset(endContainer, endOffset);

  //           console.log({
  //             text: selectedText,
  //             cursorX: event.pageX,
  //             cursorY: event.pageY,
  //             startPosition,
  //             endPosition,
  //             fullText
  //           })

  //           setSelection({
  //             text: selectedText,
  //             cursorX: event.pageX,
  //             cursorY: event.pageY,
  //             startPosition,
  //             endPosition,
  //             fullText
  //           });
  //         }
  //       }
  //     }
  //   }

  //   document.onmouseup = document.onkeyup = document.onselectionchange = mouseUpHandler

  //   return () => {
  //     document.removeEventListener('mouseup', mouseUpHandler)
  //     document.removeEventListener('keyup', mouseUpHandler)
  //     document.removeEventListener('selectionchange', mouseUpHandler)
  //   }
  // }, []);

  // useEffect(() => {
  //   if (selection.text) {
  //     setMarkdown((prevMarkdown) => {
  //       console.log(prevMarkdown.indexOf(selection.fullText))
  //       // prevMarkdown.replace(selection.fullText, )
  //       return prevMarkdown
  //     })
  //   }
  // }, [selection.text])

  if (isError) return null;

  return (
    <div>
      <Flex vertical gap="large">
        <div className='w-1/2 mx-auto px-[54px] flex flex-row justify-between mb-4'>
          <Button
            onClick={() => router.replace(`/projects/${projectId}?tab=blog-posts`)}
            icon={<ArrowLeftOutlined />}
            className='w-fit'
          >
            Back
          </Button>

          <Button
            type="primary"
            onClick={() => drawers.openExportBlogPostDrawer({ isOpen: true })}
            icon={<ExportOutlined />}
            className='w-fit'
            disabled={article?.status !== "ready_to_view"}
          >
            Export
          </Button>
        </div>

        <Spin spinning={article?.status === "writing"} tip="Your content is writing">
          <div className='w-1/2 mx-auto'>
            {!article ? (
              <Skeleton active loading className='px-[54px]' />
            ) : (
              <>
                <div
                  placeholder='Add title'
                  className='text-4xl font-extrabold w-full border-none outline-none px-[54px] mb-8'
                  contentEditable
                  onInput={debounce(onChangeTitle, 1500)}
                >
                  {articleTitle}
                </div>
                {/* <EditorBlock
                articleId={articleId}
              /> */}
                <div>
                  <div id="editor-container">
                    <MDEditor
                      articleId={articleId}
                      markdown={`${article?.markdown}` ?? ""}
                      className='px-[54px]'
                    // onChange={setMarkdown}
                    />
                  </div>
                </div>

                <div className='fixed bottom-0'>
                  <div className='flex flex-col gap-1 items-center relative bottom-20 right-60'>
                    <p className='text-center'>How do you like this article?</p>
                    <div className='flex flex-row gap-3 border rounded-full p-2 w-fit shadow-lg bg-white'>
                      <span onClick={() => sendFeedback("😡")} className='cursor-pointer text-4xl hover:scale-150 transition-all'>😡</span>
                      <span onClick={() => sendFeedback("😕")} className='cursor-pointer text-4xl hover:scale-150 transition-all'>😕</span>
                      <span onClick={() => sendFeedback("😄")} className='cursor-pointer text-4xl hover:scale-150 transition-all'>😄</span>
                      <span onClick={() => sendFeedback("😍")} className='cursor-pointer text-4xl hover:scale-150 transition-all'>😍</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Spin>
      </Flex>

      {selection.text && selection.cursorX && selection.cursorY && (
        <div
          id="ai-editor"
          className={`absolute z-10 bg-white max-w-[360px] flex flex-col gap-3 p-3 rounded-lg border shadow-xl`}
          style={{
            top: selection.cursorY,
            left: selection.cursorX,
          }}
        >
          <div className='flex flex-row gap-2'>
            <IconSparkles stroke={1.5} />
            <p className='text-base font-semibold'>AI Autocomplete</p>
          </div>
          <div className='flex flex-row flex-wrap'>
            <Button size="small" className='cursor-pointer mb-1 mr-1'>Fix spelling</Button>
            <Button size="small" className='cursor-pointer mb-1 mr-1'>Extend text</Button>
            <Button size="small" className='cursor-pointer mb-1 mr-1'>Reduce text</Button>
            <Button size="small" className='cursor-pointer mb-1 mr-1'>Simplify</Button>
            <Button size="small" className='cursor-pointer mb-1 mr-1'>Rephrase</Button>
            <Button size="small" className='cursor-pointer mb-1 mr-1'>Paraphrase</Button>
            <Button size="small" className='cursor-pointer mb-1 mr-1'>Summarize</Button>
          </div>
          <Spin spinning>
            <p>Suggestions</p>
            <p></p>
          </Spin>
        </div>
      )}

      <ExportBlogPostDrawer
        open={drawers.exportBlogPost.isOpen}
        onClose={() => drawers.openExportBlogPostDrawer({ isOpen: false })}
        articleId={articleId}
      />
    </div>
  )
}

export default Article;