'use client';
import ProjectForm from "@/components/ProjectForm/ProjectForm";
import ProjectMetaForm from "@/components/ProjectMetaForm/ProjectMetaForm";
import WritingStyleForm from "@/components/WritingStyleForm/WritingStyleForm";
import WritingStylesTable from "@/components/WritingStylesTable/WritingStylesTable";

import { Button, Tabs, TabsProps } from "antd";
import { useState } from "react";

export default function ProjectSettings({
  params,
}: {
  params: { project_id: number }
}) {
  const [activeKey, setActiveKey] = useState("general")
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);

  const items: TabsProps['items'] = [
    {
      key: 'general',
      label: 'General',
      children: <ProjectForm />,
    },
    {
      key: 'writing-style',
      label: 'Writing style',
      children: <WritingStylesTable setModalOpen={setIsWritingStyleModalOpened} />,
    },
    {
      key: 'seo-meta',
      label: 'SEO Meta',
      children: <ProjectMetaForm />,
    },
  ];

  return (
    <>
      <WritingStyleForm opened={isWritingStyleModalOpened} setModalOpen={setIsWritingStyleModalOpened} />
      <Tabs
        defaultActiveKey="general"
        items={items}
        activeKey={activeKey}
        onChange={setActiveKey}
        tabBarExtraContent={{
          right: activeKey === "writing-style" && (
            <Button type="primary" onClick={() => setIsWritingStyleModalOpened(true)}>Add writing style</Button>
          )
        }}
      />
    </>
  )
}