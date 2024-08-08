'use client';;
import { useEffect, useState } from 'react';
import useBlogPosts from '@/hooks/useBlogPosts';
import { Button, Flex, Form, message, Skeleton, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import useProjects from '@/hooks/useProjects';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';
import ExportBlogPostDrawer from '@/components/ExportBlogPostDrawer/ExportBlogPostDrawer';
import useDrawers from '@/hooks/useDrawers';
import { debounce } from 'lodash';
import { IconSparkles } from '@tabler/icons-react';
import TiptapEditor from './TiptapEditor/TiptapEditor';

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
    if (window.$crisp && ["😡", "😕"].includes(emoji)) {
      $crisp.push(["set", "message:text", [`Reaction: ${emoji}\nID: ${articleId}\nFeedback: `]]);
      $crisp.push(['do', 'chat:open']);
      return;
    } else {
      message.success('Thanks for your feedback');
    }
  }

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
                <div>
                  <div id="editor-container">
                    <div className='px-[54px]'>
                      <TiptapEditor
                        articleId={articleId}
                        content={`${article?.html}` ?? ""}
                        readOnly={false}
                      />
                    </div>
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