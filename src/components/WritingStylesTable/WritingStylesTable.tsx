'use client';
import { Alert, App, Button, Empty, Flex, Grid, Popconfirm, Space, Table, Tag } from 'antd';
import { useMemo } from 'react';
import useWritingStyles from '@/hooks/useWritingStyles';
import useProjectId from '@/hooks/useProjectId';
import { DeleteTwoTone } from '@ant-design/icons';
import { compact } from 'lodash';

type Props = {
  setModalOpen: (open: boolean) => void
}

const WritingStylesTable = ({ setModalOpen }: Props) => {
  const { getAll, delete: deleteWritingStyle, markAsDefault } = useWritingStyles();
  const { data, isPending, isFetched } = getAll();
  const projectId = useProjectId();
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();

  const columns = useMemo(() => {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 250,
        render: (value: any, record: any) => {
          if (record.default) {
            return (
              <Flex gap="middle" justify='space-between'>
                <span>
                  {value}
                </span>
                <Tag color="blue">default</Tag>
              </Flex>
            )
          }
          return (
            <span>
              {value || "-"}
            </span>
          )
        },
      },
      {
        title: 'Text',
        dataIndex: 'text',
        key: 'text',
        ellipsis: true,
        render: (value: any) => {
          return (
            <span>
              {value || "-"}
            </span>
          )
        },
      },
      {
        title: 'Characteristics',
        dataIndex: 'characteristics',
        key: 'characteristics',
        ellipsis: true,
        render: (value: any, record: any) => {
          const characteristics = compact([
            record.tones,
            record.purposes,
            record.emotions,
            record.vocabularies,
            record.sentence_structures,
            record.perspectives,
            record.writing_structures,
            record.instructional_elements,
          ].flat());

          if (characteristics.length === 0) {
            return <span>--</span>
          }

          return characteristics.map((item) => {
            return (
              <Tag style={{ marginBottom: 5 }}>{item}</Tag>
            )
          })

        },
      },
      {
        // title: 'Action',
        dataIndex: 'action',
        key: 'action',
        width: 160,
        render: (_: any, record: any) => (
          <Space size="small" align='center'>
            <Popconfirm
              disabled={record.default}
              title="Set default"
              description="Do you want to use this writing style by default?"
              onConfirm={async (e) => {
                e?.preventDefault()
                try {
                  await markAsDefault.mutateAsync({ projectId, id: record.id });
                  message.success("Writing set as default", 3)
                } catch {
                  message.error("We couldn't set your writing style as default", 3)
                }
              }}
              onCancel={(e) => {
                e?.preventDefault()
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button disabled={record.default}>
                Set as default
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Delete writing style"
              description="Are you sure to delete this writing style?"
              onConfirm={(e) => {
                e?.preventDefault()
                deleteWritingStyle.mutate({ projectId, id: record.id, isDefault: !!record.default })
              }}
              onCancel={(e) => {
                e?.preventDefault()
              }}
              okText="Yes"
              cancelText="No"
              style={{ cursor: "pointer" }}
            >
              <Button icon={<DeleteTwoTone twoToneColor="#ff4d4f" />} />
            </Popconfirm>
          </Space>
        ),
      },
    ]
  }, []);

  if (!isPending && isFetched && !data?.data?.length) {
    return (
      <Flex align='center' justify='center' style={{ marginTop: 96 }}>
        <Empty
          image="/image-1.png"
          imageStyle={{ height: screens.xs ? 125 : 200 }}
          description="You have no articles yet"
        />
        {/* <Button
            type="primary"
            onClick={() => setModalOpen(true)}
            style={{ marginTop: 12 }}
            icon={<PlusOutlined />}

          >
            Add writing style
          </Button> */}
      </Flex>
    )
  }

  if (isFetched && !!data?.data?.length) {
    const hasDefault = data.data.some((i) => i.default);

    return (
      <Flex vertical gap="large" style={{ overflow: "auto" }}>
        {!hasDefault && (
          <Alert message="You don't have a writing style set by default." type="info" showIcon />
        )}
        <Table
          size="small"
          dataSource={data?.data}
          columns={columns}
          loading={false}
          style={{ minWidth: 900, overflow: "auto" }}
        />
      </Flex>
    )
  }

  return null;
}

export default WritingStylesTable