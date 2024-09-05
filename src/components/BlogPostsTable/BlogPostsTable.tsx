'use client';;
import {
  Button,
  Drawer,
  Empty,
  Grid,
  Flex,
  Image,
  Popconfirm,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { useMemo, useState } from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  DeleteTwoTone,
  ExportOutlined
} from '@ant-design/icons';
import useBlogPosts from '@/hooks/useBlogPosts';
import useProjectId from '@/hooks/useProjectId';
import {
  IconArticle,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconBrandX,
  IconCoin,
  IconCopy,
  IconMail,
  IconWorld,
} from '@tabler/icons-react';
import Link from 'next/link';
import prettify from "pretty";
import { format } from 'date-fns';
import TiptapEditor from '@/app/(dashboard)/projects/[project_id]/articles/[article_id]/TiptapEditor/TiptapEditor';
import ExportBlogPostDrawer from '../ExportBlogPostDrawer/ExportBlogPostDrawer';
import useDrawers from '@/hooks/useDrawers';

const { useBreakpoint } = Grid

const BlogPostsTable = () => {
  const { getAll, delete: deleteArticle } = useBlogPosts()
  const { data: articles, isPending, isFetched, refetch } = getAll({ queue: false });
  const [selectedArticle, setSelectedArticle] = useState();
  const projectId = useProjectId();
  const screens = useBreakpoint();
  const drawers = useDrawers();

  const getIsDisabled = (status: string) => {
    return ["queue", "writing", "error"].includes(status)
    // return ["error", "queue"].includes(status)
  }

  const onCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    message.success("Copied to clipboard!");
  }

  const items = [
    <IconArticle />,
    <IconMail />,
    <IconBrandPinterest />,
    <IconBrandFacebook />,
    <IconBrandX />,
    <IconBrandLinkedin />,
    <IconBrandInstagram />,
  ]

  const columns = useMemo(() => {
    return [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 600,
        render: (value: any, record: any) => {
          return (
            <Link href={`/projects/${projectId}/articles/${record.id}`} className='w-full inline-block'>
              {value || "-"}
            </Link>
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
        title: 'Cost',
        dataIndex: 'cost',
        key: 'cost',
        width: 50,
        render: (_value: any, record: any) => {
          return (
            <div className='flex flex-row items-center gap-2'>
              <IconCoin stroke={1.5} />
              <p>{record?.cost ?? 0}</p>
            </div>
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
            color = "success";
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

          return (
            <span>
              <Tag color={color} icon={valueLowercase === "writing" || valueLowercase === "queue" ? icon : null}>
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
                setSelectedArticle(record)
              }}
              // onClick={(e) => {
              //   e.preventDefault();
              //   rewrite(record.id)
              // }}
              style={{ width: 100 }}
            >
              Preview
            </Button>
            {/* <Button icon={<EditOutlined />} onClick={() => router.push(`/projects/${record.project_id}/articles/${record.id}`)}>
              Edit
            </Button> */}
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
          image="/empty-state/empty-blog-posts.png"
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
      <Drawer
        open={!!selectedArticle}
        width={700}
        onClose={() => {
          setSelectedArticle(undefined)
        }}
        extra={
          <Space>
            <Button
              onClick={() => drawers.openExportBlogPostDrawer({ isOpen: true })}
              icon={<ExportOutlined />}
              className='w-fit'
              disabled={selectedArticle?.status !== "ready_to_view"}
            >
              Export
            </Button>

            <Button href={`/projects/${projectId}/articles/${selectedArticle?.id}`} style={{ width: 100 }} type="primary">
              Open
            </Button>
          </Space>
        }
      >
        {selectedArticle && (
          <div className='flex flex-col gap-4'>
            <h1 className='text-4xl font-extrabold'>{selectedArticle.title}</h1>
            <TiptapEditor
              articleId={selectedArticle.id}
              content={prettify(selectedArticle.html)}
              readOnly={false}
            />
            <ExportBlogPostDrawer
              open={drawers.exportBlogPost.isOpen}
              onClose={() => drawers.openExportBlogPostDrawer({ isOpen: false })}
              articleId={selectedArticle.id}
            />
          </div>
        )}
      </Drawer>
      <Flex vertical gap="middle" style={{ overflow: "auto" }}>
        <Table
          size="small"
          virtual
          dataSource={articles?.data ?? []}
          columns={columns ?? []}
          loading={isPending}
          // pagination={{
          //   pageSizeOptions: [10, 25, 50],
          //   pageSize: 25,
          // }}
          pagination={false}
          style={{ minWidth: 900, overflow: "auto" }}
        // onRow={(record) => {
        //   return {
        //     "aria-disabled": getIsDisabled(record.status),
        //     onClick: (event) => {
        //       console.log(event);
        //       console.log(event.target);
        //       console.log(event.target.id);
        //       if (!getIsDisabled(record.status) && !["Retry", "Preview"].includes(event?.target?.innerText)) {
        //         router.push(`/projects/${projectId}/articles/${record.id}`)
        //       }
        //     },
        //   };
        // }}
        />
      </Flex>
    </>
  )
}

export default BlogPostsTable