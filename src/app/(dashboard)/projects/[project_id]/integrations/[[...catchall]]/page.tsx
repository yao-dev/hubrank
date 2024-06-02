'use client';;
import { Card, Col, Flex, Image, Modal, Typography, Row, Grid, Tabs, Button } from 'antd';
import { useState } from 'react';
import { brandsLogo } from '@/brands-logo';
import { useRouter } from 'next/navigation';
import { useZapier } from '@/hooks/useZapier';
import { TabsProps } from "antd/lib";
import Link from 'next/link';

export default function Integrations() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hover, setHover] = useState("")
  const [selectedIntegration, setSelectedIntegration] = useState("")
  const [activeTab, setActiveTab] = useState("")
  const router = useRouter();
  const zapier = useZapier()
  const screens = Grid.useBreakpoint();

  // const onAddIntegration = () => {
  //   switch (selectedIntegration) {
  //     case "notion":
  //       return router.push(process.env.NEXT_PUBLIC_NOTION_AUTH_URL || "");
  //     case "zapier":
  //       zapier.authorize()
  //     // return router.push("https://zapier.com/developer/public-invite/205776/126f9abfb3a7cfe8264ddacfc0abeae5/")
  //   }
  // }

  const onChange = (key: string) => {
    setActiveTab(key)
  };

  const items: TabsProps['items'] = Object.keys(brandsLogo).map((brandName) => {
    let content = null;

    switch (brandName) {
      case "zapier":
        content = (
          <Link href="https://zap.new" target="_blank">
            <Button>Create new zap</Button>
          </Link>
        )
        break;
    }

    return {
      key: brandName,
      // label: `${brandName[0].toUpperCase()}${brandName.slice(1)}`,
      label: "",
      icon: <Image width={65} src={brandsLogo[brandName]} preview={false} />,
      children: content,
    }
  });

  return (
    <>
      <Modal
        title="New integration"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        okText="Add integration"
        okButtonProps={{
          disabled: !selectedIntegration
        }}
        // onOk={onAddIntegration}
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
      <Flex vertical style={{ height: "100%" }} gap="large">
        <Flex
          gap="md"
          justify="space-between"
          align="center"
        >
          <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Integrations</Typography.Title>
          {/* {screens.xs ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{ width: 150 }}
            >
              New
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{ width: 150 }}
            >
              New integration
            </Button>
          )} */}
        </Flex>
        <Tabs
          // tabPosition="left"
          defaultActiveKey="zapier"
          activeKey={activeTab}
          onChange={onChange}
          items={items}
        />
        {/* <IntegrationsTable isLoading={zapier.isLoading} /> */}
        {/* <Flex vertical flex={1} justify="center" align="center" gap={50}>
        <Image
          preview={false}
          src="/image-4.png"
          width={460}
        />
        <Typography.Text>This feature is coming soon</Typography.Text>
      </Flex> */}
      </Flex>
    </>
  )
}