'use client';;
import { Button, Form, message, Skeleton, Tabs, TabsProps } from 'antd';
import { ReactNode, useEffect, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import { useRouter, useSearchParams } from 'next/navigation';
import BlogPostsTable from '@/components/BlogPostsTable/BlogPostsTable';
import { PlusOutlined } from '@ant-design/icons';
import WritingStyleForm from '@/components/WritingStyleForm/WritingStyleForm';
import WritingStylesTable from '@/components/WritingStylesTable/WritingStylesTable';
import useDrawers from '@/hooks/useDrawers';
import NewBlogPostDrawer from '@/components/NewBlogPostDrawer/NewBlogPostDrawer';
import PageTitle from '@/components/PageTitle/PageTitle';
import { capitalize } from 'lodash';
import KnowledgesBaseTable from '@/components/KnowledgesBaseTable/KnowledgesBaseTable';
import NewKnowledgeDrawer from '@/components/NewKnowledgeDrawer/NewKnowledgeDrawer';
import KeywordsTable from '@/components/KeywordsTable/KeywordsTable';
import NewCaptionForm from '@/components/NewCaptionForm/NewCaptionForm';
import usePricingModal from '@/hooks/usePricingModal';
import { getUserId } from '@/helpers/user';
import axios from 'axios';
import { IconCopy } from '@tabler/icons-react';

export default function ProjectDetail({
  params,
}: {
  params: { project_id: number }
}) {
  const projectId = +params.project_id;
  const { data: project, isFetched } = useProjects().getOne(projectId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "blog-posts")
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const drawers = useDrawers();

  const [form] = Form.useForm();
  const pricingModal = usePricingModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captions, setCaptions] = useState([]);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") ?? "")
  }, [searchParams])

  useEffect(() => {
    if (isFetched) {
      if (!project?.id) {
        router.replace('/projects');
      }
    }
  }, [project, isFetched]);

  const writeCaption = async (values: any) => {
    try {
      setIsSubmitting(true)
      setCaptions([])
      const { data } = await axios.post('/api/credits-check', {
        user_id: await getUserId(),
        action: 'write-cpation',
      });
      if (!data.authorized) {
        setIsSubmitting(false);
        return pricingModal.open(true)
      }
      const { data: captions } = await axios.post('/api/write/caption', values);
      // form.resetFields([
      //   "goal",
      //   "description",
      //   "caption_source",
      //   "youtube_url",
      //   "with_hook",
      //   "with_question",
      //   "with_hashtags",
      //   "with_single_emoji",
      //   "with_emojis",
      //   "with_cta",
      //   "cta",
      // ]);
      setCaptions(captions.captions ?? [])
      setIsSubmitting(false)
    } catch (e) {
      setIsSubmitting(false);
      message.error("We had an issue generation your caption, please try again")
    }
  }

  const onFinish = async (values: any) => {
    await writeCaption({
      ...values,
      user_id: await getUserId(),
      project_id: projectId
    });
    return;
  };

  const onCopyCaption = (value: string) => {
    navigator.clipboard.writeText(value);
    message.success("Copied to clipboard!");
  }

  const items: TabsProps['items'] = [
    {
      key: 'blog-posts',
      label: 'Blog posts',
      children: (
        <BlogPostsTable />
      ),
    },
    {
      key: 'social-media',
      label: 'Social media',
      children: (
        <div className='flex gap-12'>
          <div className='flex flex-col gap-4 w-1/4'>
            <p className='text-xl font-bold'>Settings</p>
            <NewCaptionForm
              form={form}
              onSubmit={onFinish}
              isSubmitting={isSubmitting}
            />
            <Button
              onClick={() => form.submit()}
              type="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              className='w-fit'
            >
              Write caption (0.5 credit)
            </Button>
          </div>
          <div className='flex flex-col gap-4 w-3/5'>
            {isSubmitting && (
              <>
                <Skeleton active loading />
                <Skeleton active loading />
                <Skeleton active loading />
              </>
            )}
            {!isSubmitting && !!captions.length && (
              <>
                <p className='text-xl font-bold'>{form.getFieldValue("goal") === "reply" ? "Replies" : "Captions"}</p>

                <div className='grid grid-cols-2 gap-4'>
                  {captions.map((caption, index) => {
                    return (
                      <div key={index} contentEditable onInput={console.log} className='prose relative border rounded-lg p-4 pr-8 whitespace-pre-line outline-none'>
                        {caption}
                        <Button
                          onClick={() => onCopyCaption(caption)}
                          icon={<IconCopy />}
                          className="absolute top-2 right-2"
                        />
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'keyword-research',
      label: 'Keyword research',
      children: (
        <KeywordsTable />
      ),
    },
    {
      key: 'writing-styles',
      label: 'Writing style',
      children: <WritingStylesTable setModalOpen={setIsWritingStyleModalOpened} />,
    },
    {
      key: 'knowledge-bases',
      label: 'Knowledge bases',
      children: (
        <KnowledgesBaseTable />
      ),
    },
  ];

  // const pageTitle = useMemo(() => {
  //   return (items.find(i => i.key === activeTab)?.label ?? "") as string
  // }, [activeTab]);
  const pageTitle = (items.find(i => i.key === activeTab)?.label ?? "") as string

  if (isFetched && !project) {
    return null;
  }

  const onChange = (key: string) => {
    setActiveTab(key)
    router.push(`/projects/${params.project_id}?tab=${key}`)
  };

  const getActionButton = ({ onClick, icon, text }: { onClick: () => void; icon?: ReactNode; text: string }) => {
    return (
      <Button
        type="primary"
        onClick={onClick}
        icon={icon}
      >
        {text}
      </Button>
    )
  }

  const getTabBarExtraContent = () => {
    switch (activeTab) {
      case "blog-posts":
        return getActionButton({
          onClick: () => drawers.openBlogPostDrawer({ isOpen: true }),
          icon: <PlusOutlined />,
          text: "Blog post"
        });
      // case "social-media":
      //   return getActionButton({
      //     onClick: () => drawers.openCaptionDrawer({ isOpen: true }),
      //     icon: <PlusOutlined />,
      //     text: "Caption"
      //   });
      case "writing-styles":
        return getActionButton({
          onClick: () => setIsWritingStyleModalOpened(true),
          icon: <PlusOutlined />,
          text: "Writing style"
        })
      case "knowledge-bases":
        return getActionButton({
          onClick: () => drawers.openKnowledgeDrawer({ isOpen: true }),
          icon: <PlusOutlined />,
          text: "Knowledge"
        })
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <WritingStyleForm opened={isWritingStyleModalOpened} setModalOpen={setIsWritingStyleModalOpened} />
      <NewBlogPostDrawer
        open={drawers.blogPost.isOpen}
        onClose={() => drawers.openBlogPostDrawer({ isOpen: false })}
      />
      {/* <NewCaptionDrawer
        open={drawers.caption.isOpen}
        onClose={() => drawers.openCaptionDrawer({ isOpen: false })}
      /> */}
      <NewKnowledgeDrawer
        open={drawers.knowledge.isOpen}
        onClose={() => drawers.openKnowledgeDrawer({ isOpen: false })}
      />

      <PageTitle title={capitalize(pageTitle)} />

      <Tabs
        defaultActiveKey="blog-posts"
        activeKey={activeTab}
        onChange={onChange}
        items={items}
        tabBarExtraContent={{
          right: getTabBarExtraContent()
        }}
      />
    </div>
  );
}
