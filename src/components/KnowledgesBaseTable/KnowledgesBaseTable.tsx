'use client';;
import { Button, Flex, Popconfirm, Space, Table, Empty, Tag, message } from 'antd';
import { useMemo } from 'react';
import useKnowledges from '@/hooks/useKnowledges';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  DeleteTwoTone,
} from '@ant-design/icons';
import { IconCsv, IconFileTypeDoc, IconHtml, IconJson, IconLink, IconPdf, IconTxt } from '@tabler/icons-react';

const KnowledgesBaseTable = () => {
  const { delete: deleteKnowledge, getAll } = useKnowledges();
  const { data: knowledges, isPending, isFetched } = getAll({ queue: false });
  const [messageApi, contextHolder] = message.useMessage();

  const columns = useMemo(() => {
    return [
      {
        title: 'Content',
        dataIndex: 'content',
        key: 'content',
        width: undefined,
        ellipsis: true,
        render: (value: any) => {
          return (
            <span>{value ?? "-"}</span>
          )
        },
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        width: 100,
        render: (value: any, record: any) => {
          if (record.type === "txt") {
            return <IconTxt />
          }
          if (record.type === "pdf") {
            return <IconPdf />
          }
          if (record.type === "json") {
            return <IconJson />
          }
          if (record.type === "doc") {
            return <IconFileTypeDoc />
          }
          if (record.type === "csv") {
            return <IconCsv />
          }
          if (record.type === "html") {
            return <IconHtml />
          }
          if (record.type === "url") {
            return <IconLink />
          }
          return (
            <span>{value ?? "-"}</span>
          )
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        filters: [
          { text: 'Queue', value: 'queue' },
          { text: 'Training', value: 'training' },
          { text: 'Ready', value: 'ready' },
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
          if (valueLowercase === "ready") {
            color = "success";
            icon = <CheckCircleOutlined />;
          }
          if (valueLowercase === "training") {
            color = "blue";
            icon = <SyncOutlined spin />;
          }
          if (valueLowercase === "error") {
            color = "error";
            icon = <CloseCircleOutlined />;
          }

          return (
            <span>
              <Tag color={color} icon={["training", "queue"].includes(valueLowercase) ? icon : null}>
                {/* {value.toUpperCase()} */}
                {value.replaceAll("_", " ").toUpperCase()}
              </Tag>
            </span>
          )
        },
      },
      {
        dataIndex: 'action',
        key: 'action',
        render: (_: any, record: any) => (
          <Space size="small" align='center'>
            <Popconfirm
              title="Delete knowledge"
              description="Are you sure to delete this knowledge?"
              onConfirm={(e) => {
                e?.preventDefault();
                try {
                  deleteKnowledge.mutate(record.id);
                  message.success('Knowledge deleted');
                } catch (e) {
                  console.error(e)
                  message.error('We couldn\'nt delete this knowledge');
                }

              }}
              onCancel={(e) => {
                e?.preventDefault()
              }}
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                danger: true,
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

  if (!isPending && isFetched && !knowledges?.data?.length) {
    return (
      <Flex align='center' justify='center' style={{ marginTop: 96 }}>
        <Empty
          image="/empty-state/empty-knowledges.png"
          imageStyle={{ height: 250 }}
          description={(
            <span className='m-0 relative top-4 text-base'>
              You have no knowledges added yet
            </span>
          )}
        />
      </Flex>
    )
  }

  return (
    <Flex vertical gap="middle" style={{ overflow: "auto" }}>
      {contextHolder}
      <Table
        size="small"
        dataSource={knowledges?.data}
        columns={columns}
        loading={false}
        // pagination={{
        //   pageSizeOptions: [10, 25, 50],
        //   pageSize: 25,
        // }}
        pagination={false}
        style={{ minWidth: 900, overflow: "auto" }}
      />
    </Flex>
  )
}

export default KnowledgesBaseTable