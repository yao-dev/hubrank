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
} from '@ant-design/icons';
import useBlogPosts from '@/hooks/useBlogPosts';
import { useRouter } from 'next/navigation';
import useProjectId from '@/hooks/useProjectId';
import {
  IconArticle,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandPinterest,
  IconBrandX,
  IconCopy,
  IconMail,
  IconWorld,
} from '@tabler/icons-react';

const { useBreakpoint } = Grid

const BlogPostsTable = () => {
  const { getAll, delete: deleteArticle } = useBlogPosts()
  const { data: articles, isPending, isFetched, refetch } = getAll({ queue: false });
  const [htmlPreview, setHtmlPreview] = useState("");
  const [articleId, setArticleId] = useState(null);
  const router = useRouter();
  const projectId = useProjectId();
  const screens = useBreakpoint();

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
        width: !screens.lg ? 800 : null,
        render: (value: any) => {
          return (
            <span>
              {value || "-"}
            </span>
          )
        },
      },
      {
        title: 'Keyword',
        dataIndex: 'seed_keyword',
        key: 'seed_keyword',
        width: 350,
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
                setArticleId(record.id)
                setHtmlPreview(record.html)
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
      {/* <Modal
        title="Preview"
        open={!!htmlPreview}
        onCancel={() => setHtmlPreview("")}
        style={{ top: 20 }}
        width={800}
      >
        <div dangerouslySetInnerHTML={{ __html: `<div style="width:800px;">${htmlPreview}</div>` }} />
      </Modal> */}
      <Drawer
        open={!!htmlPreview}
        width={800}
        onClose={() => setHtmlPreview("")}
        extra={
          <Space>
            <Button style={{ width: 100 }} type="primary" onClick={() => router.push(`/projects/${projectId}/articles/${articleId}`)}>
              Edit
            </Button>
          </Space>
        }
      >
        <div dangerouslySetInnerHTML={{
          __html: `
          <style>
          img {
            max-width: 100%;
          }
          h1 {
            margin-top: 0px;
          }
          </style>
          ${htmlPreview}
        ` }} />
      </Drawer>
      <Flex vertical gap="middle" style={{ overflow: "auto" }}>
        <Table
          size="small"
          dataSource={articles?.data}
          columns={columns}
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