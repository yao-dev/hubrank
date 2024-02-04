'use client';;
import { Button, Card, Col, Flex, Image, Modal, Popconfirm, Row, Space, Spin, Table } from 'antd';
import { useMemo, useState } from 'react';
import { DeleteTwoTone, PlusOutlined } from '@ant-design/icons';
import { brandsLogo } from '@/brands-logo';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import supabase from '@/helpers/supabase';
import { useZapier } from '@/hooks/useZapier';

const IntegrationsTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hover, setHover] = useState("")
  const [selectedIntegration, setSelectedIntegration] = useState("")
  const router = useRouter();
  const queryClient = useQueryClient();
  const zapier = useZapier()

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

  const onAddIntegration = () => {
    switch (selectedIntegration) {
      case "notion":
        return router.push(process.env.NEXT_PUBLIC_NOTION_AUTH_URL || "");
      case "zapier":
        return zapier.login()
    }
  }

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
        title: 'Action',
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
  //         imageStyle={{ height: 200 }}
  //         description="You have no articles yet"
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
    <Spin spinning={zapier.isLoading}>
      <Modal
        title="New integration"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Add integration"
        okButtonProps={{
          disabled: !selectedIntegration
        }}
        onOk={onAddIntegration}
        style={{ top: 20 }}
        width={700}
      >
        <Row>
          {Object.keys(brandsLogo).map((brandName) => {
            return (
              <Col key={brandName} style={{ width: "31%", margin: 5, overflow: "hidden" }} onMouseEnter={() => setHover(brandName)} onMouseLeave={() => setHover("")}>
                <Card
                  style={{
                    height: 125,
                    display: "flex",
                    borderColor: [hover, selectedIntegration].includes(brandName) ? "rgb(93 95 239)" : undefined,
                    borderWidth: [hover, selectedIntegration].includes(brandName) ? 3 : 1,
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                  }}
                  onClick={() => setSelectedIntegration(brandName)}
                >
                  <Image width={100} src={brandsLogo[brandName]} preview={false} />
                </Card>
              </Col>
            )
          })}
        </Row>
      </Modal>
      <Flex vertical gap="middle">
        <Flex justify="end">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{ width: 150 }}
          >
            New integration
          </Button>
        </Flex>
        <Table
          size="small"
          // dataSource={articles?.data}
          dataSource={integrations || []}
          columns={columns}
          // loading={isLoading}
          pagination={{
            pageSizeOptions: [10, 25, 50],
            pageSize: 25,
          }}
        />
      </Flex>
    </Spin>
  )
}

export default IntegrationsTable