'use client';;
import { Button, Drawer, Empty, Flex, Image, Popconfirm, Space, Table, Tag, message } from 'antd';
import { useMemo, useState } from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  DeleteTwoTone,
} from '@ant-design/icons';
import useBlogPosts from '@/hooks/useBlogPosts';
import useProjectId from '@/hooks/useProjectId';
import { IconCopy, IconWorld } from '@tabler/icons-react';
import Link from 'next/link';
import prettify from "pretty";
import { format } from 'date-fns';
import TiptapEditor from '@/app/app/(dashboard)/projects/[project_id]/articles/[article_id]/TiptapEditor/TiptapEditor';
import ExportBlogPostDrawer from '../ExportBlogPostDrawer/ExportBlogPostDrawer';
import useDrawers from '@/hooks/useDrawers';
import useIntegrations from '@/hooks/useIntegrations';
import { isEmpty } from 'lodash';
import { useRouter } from 'next/navigation';
import PublishBlogPostButton from '../PublishBlogPostButton/PublishBlogPostButton';

const BlogPostsTable = () => {
  const { getAll, delete: deleteArticle, update: updateBlogPost } = useBlogPosts()
  const { data: articles, isPending, isFetched, refetch } = getAll({ queue: false });
  const [preview, setPreview] = useState();
  const [publish, setPublish] = useState();
  const projectId = useProjectId();
  const drawers = useDrawers();
  const { data: integrations } = useIntegrations({ enabled: true });
  const hasIntegrations = !isEmpty(integrations)
  const router = useRouter();

  const getIsDisabled = (status: string) => {
    return ["queue", "writing", "error"].includes(status)
  }

  const onCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    message.success("Copied to clipboard!");
  }

  const columns = useMemo(() => {
    return [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 600,
        render: (value: any, record: any) => {
          if (["ready_to_view", "published"].includes(record.status)) {
            return (
              <Link href={`/projects/${projectId}/articles/${record.id}`} className='w-full inline-block'>
                {value || "-"}
              </Link>
            )
          }
          return (
            <p className='cursor-not-allowed'>{value || "-"}</p>
          )
        },
      },
      {
        title: 'Keyword',
        dataIndex: 'seed_keyword',
        key: 'seed_keyword',
        width: 225,
        render: (value: any) => {
          if (value) {
            return (
              <Flex gap="middle" align='center' justify='space-between'>
                <span>{value}</span>
                <IconCopy onClick={() => onCopyKeyword(value)} stroke={1.5} style={{ cursor: "pointer" }} />
              </Flex>
            )
          }
          return (
            <span>-</span>
          )
        },
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        width: 175,
        render: (_value: any, record: any) => {
          return (
            <p>{format(record.created_at, 'LLL dd, h:mm aaa')}</p>
          )
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        filters: [
          { text: 'Queue', value: 'queue' },
          { text: 'Writing', value: 'writing' },
          { text: 'Ready to view', value: 'ready_to_view' },
          { text: 'Publishing', value: 'publishing' },
          { text: 'Published', value: 'published' },
          { text: 'Error', value: 'error' },
        ],
        width: 175,
        onFilter: (value: string, record: any) => record.status.toLowerCase().includes(value),
        render: (value: any) => {
          if (!value) {
            return (
              <span>-</span>
            )
          }

          let color;
          let icon;
          const valueLowercase = value.toLowerCase()

          if (valueLowercase === "queue") {
            color = "default";
            icon = <ClockCircleOutlined />;
          }
          if (valueLowercase === "ready_to_view") {
            color = "cyan";
            icon = <CheckCircleOutlined />;
          }
          if (valueLowercase === "writing") {
            color = "blue";
            icon = <SyncOutlined spin />;
          }
          if (valueLowercase === "error") {
            color = "error";
            icon = <CloseCircleOutlined />;
          }
          if (valueLowercase === "publishing") {
            color = "purple";
            icon = <SyncOutlined spin />;
          }
          if (valueLowercase === "published") {
            color = "green";
            icon = <CheckCircleOutlined />;
          }

          return (
            <span>
              <Tag color={color} icon={["queue", "writing", "publishing", "published"].includes(valueLowercase) ? icon : null}>
                {value.replaceAll("_", " ").toUpperCase()}
              </Tag>
            </span>
          )
        },
      },
      {
        title: <IconWorld stroke={1.5} />,
        dataIndex: 'language',
        key: 'language',
        width: 50,
        render: (_value: any, record: any) => {
          if (!record?.languages?.image) {
            return (
              <span>-</span>
            )
          }
          return (
            <Image src={record.languages.image} width={25} height={25} preview={false} />
          )
        },
      },
      {
        // title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (_: any, record: any) => (
          <Space size="small" align='center'>
            {/* <Button
              onClick={() => {
                setSelectedKeyword(record.keyword);
                setArticleDrawerOpen(true)
              }}
            >
              use keyword
            </Button> */}
            {/* {record.status === "error" && record.retry_count < 2 ? (
              <Button
                style={{ width: 100 }}
                icon={<ReloadOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  rewrite(record.id)
                }}
                loading={isRetrying}
              >
                Retry
              </Button>
            ) : null} */}
            {/* {record.status === "error" && record.retry_count > 1 && (
              <Button
                onClick={(e) => { e.preventDefault() }}
                style={{ width: 100 }}
              >
                Contact us
              </Button>
            )} */}
            <Button
              disabled={getIsDisabled(record.status)}
              onClick={(e) => {
                e.preventDefault();
                setPreview(record)
              }}
              style={{ width: 100 }}
            >
              Preview
            </Button>

            <PublishBlogPostButton
              id={record.id}
              disabled={getIsDisabled(record.status) || ["publishing"].includes(record.status)}
            />

            <Popconfirm
              title="Delete article"
              description="Are you sure to delete this article?"
              onConfirm={(e) => {
                e?.preventDefault()
                deleteArticle.mutate(record.id)
              }}
              onCancel={(e) => {
                e?.preventDefault()
              }}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                danger: true
              }}
              style={{ cursor: "pointer" }}
              onPopupClick={e => e.preventDefault()}
            >
              <Button
                onClick={(e) => e.preventDefault()}
                disabled={record.status === "writing"}
                icon={(
                  <DeleteTwoTone
                    onClick={(e) => e.preventDefault()}
                    twoToneColor="#ff4d4f"
                  />
                )}
              />
            </Popconfirm>
          </Space>
        ),
      },
    ]
  }, []);

  if (!isPending && isFetched && !articles?.data?.length) {
    return (
      <Flex align='center' justify='center' style={{ marginTop: 96 }}>
        <Empty
          image="https://usehubrank.com/empty-state/empty-blog-posts.png"
          imageStyle={{ height: 250 }}
          description={(
            <span className='m-0 relative top-4 text-base'>
              You have no articles yet
            </span>
          )}
        />
      </Flex>
    )
  }

  return (
    <>
      <ExportBlogPostDrawer
        open={!!publish}
        onClose={() => {
          drawers.openExportBlogPostDrawer({ isOpen: false })
          setPublish(undefined)
        }}
        articleId={publish?.id}
      />

      <Drawer
        open={!!preview}
        width={700}
        onClose={() => {
          setPreview(undefined)
        }}
        extra={
          <Button href={`/projects/${projectId}/articles/${preview?.id}`} style={{ width: 100 }} type="primary">
            Open
          </Button>
        }
      >
        {preview && (
          <div className='flex flex-col gap-4'>
            <h1 className='text-4xl font-extrabold'>{preview.title}</h1>
            <TiptapEditor
              articleId={preview.id}
              content={prettify(preview.html)}
              readOnly={false}
            />
          </div>
        )}
      </Drawer>
      <Flex vertical gap="middle" style={{ overflow: "auto" }}>
        <Table
          size="small"
          virtual
          dataSource={articles?.data ?? []}
          columns={columns?.map(column => ({
            ...column,
            onFilter: (value, record) => value === record[column.dataIndex]
          })) ?? []}
          loading={isPending}
          pagination={{
            pageSize: 25,
            position: ["bottomCenter"],
            showSizeChanger: false,
            size: "default",
            responsive: true
          }}
          style={{ minWidth: 900, overflow: "auto" }}
        />
      </Flex>
    </>
  )
}

export default BlogPostsTable