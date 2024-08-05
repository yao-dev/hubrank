'use client';;
import { Button, Flex, Popconfirm, Space, Table, Image, message, Empty, Grid } from 'antd';
import { useMemo } from 'react';
import { DeleteTwoTone } from '@ant-design/icons';
import { IconCoin, IconCopy, IconWorld } from '@tabler/icons-react';
import useCaptions from '@/hooks/useCaptions';
import { platforms } from '@/options';
import { format } from 'date-fns';

const { useBreakpoint } = Grid

const CaptionsTable = () => {
  const { delete: deleteCaption, getAll } = useCaptions();
  const { data: captions, isPending, isFetched } = getAll({ queue: false });
  const screens = useBreakpoint();

  const onCopyCaption = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success("Copied to clipboard!");
  }

  const columns = useMemo(() => {
    return [
      {
        dataIndex: 'platform',
        key: 'platform',
        width: 50,
        render: (_value: any, record: any) => {
          if (!record?.platform) {
            return (
              <span>-</span>
            )
          }
          return platforms[record.platform].icon;
        },
      },
      {
        title: 'Content',
        dataIndex: 'caption',
        key: 'content',
        width: null,
        render: (value: any) => {
          return (
            <span>{value ?? "-"}</span>
          )
        },
      },
      {
        dataIndex: 'copy',
        width: 50,
        render: (_value: any, record: any) => {
          return (
            <IconCopy onClick={() => onCopyCaption(value)} stroke={1.5} style={{ cursor: "pointer" }} className='mx-auto' />
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
            <div className='flex flex-row gap-2'>
              <IconCoin stroke={1.5} />
              <p>{record?.cost ?? 0}</p>
            </div>
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
      // {
      //   title: 'Status',
      //   dataIndex: 'status',
      //   key: 'status',
      //   filters: [
      //     { text: 'Queue', value: 'queue' },
      //     { text: 'Writing', value: 'writing' },
      //     { text: 'Ready to view', value: 'ready_to_view' },
      //     { text: 'Error', value: 'error' },
      //   ],
      //   width: 175,
      //   onFilter: (value: string, record: any) => record.status.toLowerCase().includes(value),
      //   render: (value: any) => {
      //     if (!value) {
      //       return (
      //         <span>-</span>
      //       )
      //     }

      //     let color;
      //     let icon;
      //     const valueLowercase = value.toLowerCase()

      //     if (valueLowercase === "queue") {
      //       color = "default";
      //       icon = <ClockCircleOutlined />;
      //     }
      //     if (valueLowercase === "ready_to_view") {
      //       color = "success";
      //       icon = <CheckCircleOutlined />;
      //     }
      //     if (valueLowercase === "writing") {
      //       color = "blue";
      //       icon = <SyncOutlined spin />;
      //     }
      //     if (valueLowercase === "error") {
      //       color = "error";
      //       icon = <CloseCircleOutlined />;
      //     }

      //     return (
      //       <span>
      //         <Tag color={color} icon={valueLowercase === "writing" || valueLowercase === "queue" ? icon : null}>
      //           {/* {value.toUpperCase()} */}
      //           {value.replaceAll("_", " ").toUpperCase()}
      //         </Tag>
      //       </span>
      //     )
      //   },
      // },
      {
        dataIndex: 'action',
        key: 'action',
        render: (_: any, record: any) => (
          <Space size="small" align='center'>
            <Popconfirm
              title="Delete caption"
              description="Are you sure to delete this caption?"
              onConfirm={(e) => {
                e?.preventDefault();
                deleteCaption.mutate(record.id)
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

  if (!isPending && isFetched && !captions?.data?.length) {
    return (
      <Flex align='center' justify='center' style={{ marginTop: 96 }}>
        <Empty
          image="/empty-state/empty-social-media.png"
          imageStyle={{ height: 250 }}
          description={(
            <span className='m-0 relative top-4 text-base'>
              You have no captions yet
            </span>
          )}
        />
      </Flex>
    )
  }

  return (
    <Flex vertical gap="middle" style={{ overflow: "auto" }}>
      <Table
        size="small"
        dataSource={captions?.data}
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

export default CaptionsTable