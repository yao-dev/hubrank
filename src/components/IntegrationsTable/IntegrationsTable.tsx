'use client';;
import { Button, Image, Popconfirm, Spin, Switch, Table, Tag } from 'antd';
import { useMemo } from 'react';
import { DeleteTwoTone } from '@ant-design/icons';
import { brandsLogo } from '@/brands-logo';
import { useMutation } from '@tanstack/react-query';
import supabase from '@/helpers/supabase/client';
import { format } from 'date-fns';
import queryKeys from '@/helpers/queryKeys';
import useProjectId from '@/hooks/useProjectId';
import { IconWebhook } from '@tabler/icons-react';
import useIntegrations from '@/hooks/useIntegrations';

const IntegrationsTable = ({ isLoading }: any) => {
  const projectId = useProjectId();
  const { data: integrations, refetch } = useIntegrations()

  const updateIntegration = useMutation({
    mutationKey: queryKeys.integrations({ projectId }),
    mutationFn: async ({ id, ...updates }) => {
      return supabase.from("integrations").update(updates).eq("id", id)
    },
    onSuccess: () => {
      refetch()
    }
  })

  const deleteIntegration = useMutation({
    mutationKey: queryKeys.integrations({ projectId }),
    mutationFn: async (integrationId) => {
      return supabase.from("integrations").delete().eq("id", integrationId)
    },
    onSuccess: () => {
      refetch()
    }
  })

  const columns = useMemo(() => {
    return [
      {
        title: 'Platform',
        dataIndex: 'platform',
        key: 'platform',
        width: 75,
        render: (_value: any, record: any) => {
          return record.platform === "webhook" ? <IconWebhook /> : <Image height={25} src={brandsLogo[record.platform]} preview={false} />
        },
      },
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (value: any) => {
          return (
            <span>
              {value || "-"}
            </span>
          )
        },
      },
      {
        title: 'API Key',
        dataIndex: 'api_key',
        key: 'api_key',
        width: 300,
        render: (value: any, record: any) => {
          // admin_api_key, api_url, status, webhook, url, username, password

          if (record?.metadata?.api_key) {
            return (
              <span>
                <Tag>{record.metadata.api_key}</Tag>
              </span>
            )
          }
          return (
            <span>-</span>
          )
        },
      },
      {
        title: 'API URL',
        dataIndex: 'api_url',
        key: 'api_url',
        width: 300,
        render: (value: any, record: any) => {
          if (record?.metadata?.api_url) {
            return (
              <span>
                <Tag>{record.metadata.api_url}</Tag>
              </span>
            )
          }
          return (
            <span>-</span>
          )
        },
      },
      {
        title: 'Webhook',
        dataIndex: 'webhook',
        key: 'webhook',
        width: 300,
        render: (value: any, record: any) => {
          if (record?.metadata?.webhook) {
            return (
              <span>
                <Tag>{record.metadata.webhook}</Tag>
              </span>
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
        // title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (_: any, record: any) => (
          <div className='flex flex-row items-center gap-4'>
            {/* <Button
              icon={<CopyOutlined />}
            />
            <Button
              icon={<EditOutlined />}
            /> */}
            <Switch
              className='w-fit'
              defaultChecked={record.enabled}
              onChange={(value) => {
                updateIntegration.mutate({ id: record.id, enabled: value });
              }}
            />
            <Popconfirm
              title="Delete integration"
              description="Are you sure to delete this integration?"
              okText="Yes"
              cancelText="No"
              okButtonProps={{
                danger: true
              }}
              style={{ cursor: "pointer" }}
              onConfirm={() => {
                deleteIntegration.mutate(record.id)
              }}
            >
              <Button
                icon={(
                  <DeleteTwoTone
                    twoToneColor="#ff4d4f"
                  />
                )}
              />
            </Popconfirm>
          </div >
        ),
      },
    ]
  }, []);

  // if (!isLoading && isFetched && !articles?.data?.length) {
  //   return (
  //     <Flex align='center' justify='center' style={{ marginTop: 96 }}>
  //       <Empty
  //         image="/image-1.png"
  // imageStyle={{ height: 250 }}
  // description={(
  //   <span className='m-0 relative top-4 text-base'>
  //     You have no integrations yet
  //   </span>
  // )}
  //       >
  // <Button
  //   type="primary"
  //   icon={<PlusOutlined />}
  //   onClick={() => setIsModalOpen(true)}
  //   style={{ marginTop: 12 }}
  // >
  //   New integration
  // </Button>
  //       </Empty>
  //     </Flex>
  //   )
  // }


  return (
    <Spin spinning={isLoading}>
      <div style={{ overflow: "auto" }}>
        <Table
          size="small"
          // dataSource={articles?.data}
          dataSource={integrations || []}
          columns={columns}
          // loading={isLoading}
          // pagination={{
          //   pageSizeOptions: [10, 25, 50],
          //   pageSize: 25,
          // }}
          pagination={false}
        // style={{ width: "auto", overflow: "auto" }}
        // className='w-fit'
        />
      </div>
    </Spin>
  )
}

export default IntegrationsTable