'use client';;
import ProjectForm from "@/components/ProjectForm/ProjectForm";
import ProjectMetaForm from "@/components/ProjectMetaForm/ProjectMetaForm";
import { Tabs, TabsProps } from "antd";

export default function ProjectSettings({
  params,
}: {
  params: { project_id: number }
}) {
  const items: TabsProps['items'] = [
    {
      key: 'general',
      label: 'General',
      children: <ProjectForm />,
    },
    {
      key: 'seo-meta',
      label: 'SEO Meta',
      children: <ProjectMetaForm />,
    },
  ];

  return (
    <>
      <Tabs defaultActiveKey="1" items={items} />
    </>
  )
}