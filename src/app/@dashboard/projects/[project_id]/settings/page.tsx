'use client';
import ProjectForm from "@/components/ProjectForm/ProjectForm";
import ProjectMetaForm from "@/components/ProjectMetaForm/ProjectMetaForm";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { Button, Col, Row, Tabs, TabsProps } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProjectSettings({
  params,
}: {
  params: { project_id: number }
}) {
  const router = useRouter();
  const [activeKey, setActiveKey] = useState("general");

  const items: TabsProps['items'] = [
    {
      key: 'general',
      label: 'General',
      children: (
        <ProjectForm />
      ),
    },
    {
      key: 'seo-meta',
      label: 'SEO Meta',
      children: (
        <ProjectMetaForm />
      ),
    },
  ];

  return (
    <>
      <Row>
        <Col span={8}>
          <Button onClick={() => router.back()} icon={<ArrowLeftOutlined />}>Back</Button>
        </Col>
        <Col span={8}>
          <Tabs
            centered
            defaultActiveKey="general"
            items={items}
            activeKey={activeKey}
            onChange={setActiveKey}
          />
        </Col>
      </Row>
    </>
  )
}