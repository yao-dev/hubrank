'use client';;
import { Button, Flex, Popconfirm, Space, Table, Empty, Typography, Grid, Tag } from 'antd';
import { useMemo } from 'react';
import useKnowledges from '@/hooks/useKnowledges';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  DeleteTwoTone,
} from '@ant-design/icons';

const { useBreakpoint } = Grid

const KnowledgesBaseTable = () => {
  const { delete: deleteKnowledge, getAll } = useKnowledges();
  const { data: knowledges, isPending, isFetched } = getAll({ queue: false });
  const screens = useBreakpoint();

  const columns = useMemo(() => {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: null,
        render: (value: any) => {
          return (
            <span>{value ?? "-"}</span>
          )
        },
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        width: null,
        render: (value: any) => {
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
          { text: 'Learning', value: 'learning' },
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
          if (valueLowercase === "learning") {
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
                deleteKnowledge.mutate(record.id)
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

  if (!isPending && isFetched && !knowledges?.data?.length) {
    return (
      <Flex align='center' justify='center' style={{ marginTop: 96 }}>
        <Empty
          image="/empty-state/empty-knowledges.png"
          imageStyle={{ height: screens.xs ? 125 : 200, margin: "auto", display: "flex" }}
          description={(
            <Typography.Text style={{ margin: 0, position: "relative", top: 15 }}>
              You have no knowledges added yet
            </Typography.Text>
          )}
        />
      </Flex>
    )
  }

  return (
    <Flex vertical gap="middle" style={{ overflow: "auto" }}>
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