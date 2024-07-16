'use client';;
import { Button, Flex, Popconfirm, Space, Table, Image, message, Empty, Typography, Grid } from 'antd';
import { useMemo } from 'react';
import { DeleteTwoTone } from '@ant-design/icons';
import { IconCopy, IconWorld } from '@tabler/icons-react';
import useCaptions from '@/hooks/useCaptions';
import { platforms } from '@/options';

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
        title: 'Caption',
        dataIndex: 'caption',
        key: 'caption',
        width: null,
        render: (value: any) => {
          return (
            <span>{value ?? "-"}</span>
          )
        },
      },
      {
        dataIndex: 'caption',
        key: 'caption',
        width: 50,
        render: (_value: any, record: any) => {
          return (
            <IconCopy onClick={() => onCopyCaption(value)} stroke={1.5} style={{ cursor: "pointer" }} />
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
          imageStyle={{ height: screens.xs ? 125 : 200 }}
          description={(
            <Typography.Text style={{ margin: 0, position: "relative", top: 15 }}>
              You have no captions yet
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