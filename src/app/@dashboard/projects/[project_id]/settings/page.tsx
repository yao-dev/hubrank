'use client';;
import ProjectForm from "@/components/ProjectForm/ProjectForm";
import ProjectMetaForm from "@/components/ProjectMetaForm/ProjectMetaForm";

import { Col, Row, Tabs, TabsProps } from "antd";
import { useState } from "react";

export default function ProjectSettings({
  params,
}: {
  params: { project_id: number }
}) {
  const [activeKey, setActiveKey] = useState("general")

  const items: TabsProps['items'] = [
    {
      key: 'general',
      label: 'General',
      children: (
        <Row>
          <Col offset={8} span={8}>
            <ProjectForm />
          </Col>
        </Row>
      ),
    },
    {
      key: 'seo-meta',
      label: 'SEO Meta',
      children: (
        <Row>
          <Col offset={8} span={8}>
            <ProjectMetaForm />
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <>
      <Tabs
        centered
        defaultActiveKey="general"
        items={items}
        activeKey={activeKey}
        onChange={setActiveKey}
      />
    </>
  )
}