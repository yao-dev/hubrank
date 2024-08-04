'use client';;
import { useEffect, useRef, useState } from 'react';
import useBlogPosts from '@/hooks/useBlogPosts';
import { Button, Flex, Form, Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
// import "./styles.css";
import useProjects from '@/hooks/useProjects';
import { ArrowLeftOutlined, ExportOutlined } from '@ant-design/icons';
import ExportBlogPostDrawer from '@/components/ExportBlogPostDrawer/ExportBlogPostDrawer';
import useDrawers from '@/hooks/useDrawers';
import { debounce } from 'lodash';
import { MDXEditorMethods } from '@mdxeditor/editor';
import MDEditor from './MDEditor/MDEditor';

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
  const [articleTitle, setArticleTitle] = useState("")
  const [seoForm] = Form.useForm();
  const drawers = useDrawers();
  const ref = useRef<MDXEditorMethods>(null)

  useEffect(() => {
    if (article) {
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

  const getBlogUrl = () => {
    if (!project) return "";
    return new URL(`${project.blog_path}`, new URL(project.website).href).href
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
          >
            Export
          </Button>
        </div>

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
              <MDEditor
                ref={ref}
                articleId={articleId}
                markdown={article?.markdown ?? ""}
                className='prose px-[54px]'
              />
            </>
          )}
        </div>
      </Flex>

      <ExportBlogPostDrawer
        open={drawers.exportBlogPost.isOpen}
        onClose={() => drawers.openExportBlogPostDrawer({ isOpen: false })}
        articleId={articleId}
      />
    </div>
  )
}

export default Article;