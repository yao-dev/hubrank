'use client';;
import { Button, Image, Popconfirm, Space, Spin, Table } from 'antd';
import { useMemo } from 'react';
import { DeleteTwoTone } from '@ant-design/icons';
import { brandsLogo } from '@/brands-logo';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '@/helpers/supabase';

const IntegrationsTable = ({ isLoading }: any) => {
  const queryClient = useQueryClient();

  const { data: integrations } = useQuery({
    queryKey: ["integrations"],
    queryFn: () => {
      return supabase.from("integrations").select("*")
    },
    select: ({ data }) => {
      return data || []
    }
  });

  const integrationFn = useMutation({
    mutationKey: ["integrations"],
    mutationFn: async (integrationId) => {
      return supabase.from("integrations").delete().eq("id", integrationId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["integrations"],
      });
    }
  })

  const columns = useMemo(() => {
    return [
      // {
      //   title: 'Name',
      //   dataIndex: 'name',
      //   key: 'name',
      //   width: "20%",
      //   render: (value: any) => {
      //     return (
      //       <span>
      //         {value || "-"}
      //       </span>
      //     )
      //   },
      // },
      {
        title: 'Platform',
        dataIndex: 'platform',
        key: 'platform',
        width: "100%",
        render: (_value: any, record: any) => {
          return (
            <Image height={25} src={brandsLogo[record.platform]} preview={false} />
          )
        },
      },
      // {
      //   title: 'API Key',
      //   dataIndex: 'api_key',
      //   key: 'api_key',
      //   width: "100%",
      //   render: (value: any) => {
      //     return (
      //       <span>
      //         {value || "-"}
      //       </span>
      //     )
      //   },
      // },
      {
        // title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (_: any, record: any) => (
          <Space size="small" align='center'>
            {/* <Button
              icon={<CopyOutlined />}
            />
            <Button
              icon={<EditOutlined />}
            /> */}
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
                integrationFn.mutate(record.id)
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
          </Space >
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
          style={{ minWidth: 900, overflow: "auto" }}
        />
      </div>
    </Spin>
  )
}

export default IntegrationsTable