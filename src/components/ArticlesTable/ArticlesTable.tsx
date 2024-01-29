'use client';;
import { Button, Drawer, Empty, Flex, Image, Popconfirm, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  PlusOutlined,
  DeleteTwoTone,
} from '@ant-design/icons';
import useBlogPosts from '@/hooks/useBlogPosts';
import { useRouter } from 'next/navigation';
import useProjectId from '@/hooks/useProjectId';

type Props = {
  setSelectedKeyword: (k: string) => void;
  setArticleDrawerOpen: (value: boolean) => void;
}

const ArticlesTable = ({ setSelectedKeyword, setArticleDrawerOpen }: Props) => {
  const { getAll, delete: deleteArticle } = useBlogPosts()
  const { data: articles, isLoading, isFetched } = getAll({ queue: false });
  const [htmlPreview, setHtmlPreview] = useState("");
  const router = useRouter();
  const projectId = useProjectId();

  const columns = useMemo(() => {
    return [
      {
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
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 750,
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
          return (
            <span>
              {value || "-"}
            </span>
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
            color = "processing";
            icon = <SyncOutlined spin />;
          }
          if (valueLowercase === "error") {
            color = "error";
            icon = <CloseCircleOutlined />;
          }

          return (
            <span>
              <Tag color={color} icon={null}>
                {/* {value.toUpperCase()} */}
                {value.replaceAll("_", " ").toUpperCase()}
              </Tag>
            </span>
          )
        },
      },
      {
        title: 'Action',
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
            <Button onClick={() => setHtmlPreview(record.html)}>
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
            >
              <Button icon={<DeleteTwoTone twoToneColor="#ff4d4f" />} />
            </Popconfirm>
          </Space>
        ),
      },
    ]
  }, []);

  if (!isLoading && isFetched && !articles?.data?.length) {
    return (
      <Flex align='center' justify='center' style={{ marginTop: 96 }}>
        <Empty
          image="/image-1.png"
          imageStyle={{ height: 200 }}
          description="You have no articles yet"
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setArticleDrawerOpen(true)}
            style={{ marginTop: 12 }}
          >
            Create article
          </Button>
        </Empty>
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
      <Table
        size="small"
        dataSource={articles?.data}
        columns={columns}
        loading={isLoading}
        onRow={(record) => {
          return {
            onClick: (event) => {
              // console.log(event)
              router.push(`/projects/${projectId}/articles/${record.id}`)
            },
          };
        }}
      />
    </>
  )
}

export default ArticlesTable