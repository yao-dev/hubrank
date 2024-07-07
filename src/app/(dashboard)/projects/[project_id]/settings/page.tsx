'use client';;
import ProjectForm from "@/components/ProjectForm/ProjectForm";

import { Col, Flex, Row, TabsProps, Typography } from "antd";

export default function ProjectSettings({
  params,
}: {
  params: { project_id: number }
}) {
  // const router = useRouter();
  // const [activeKey, setActiveKey] = useState("project");

  const items: TabsProps['items'] = [
    {
      key: 'project',
      label: 'Project',
      children: (
        <ProjectForm />
      ),
    },
  ];

  return (
    <Flex vertical gap="large">
      <Typography.Title level={3} style={{ fontWeight: 700, margin: 0 }}>Project settings</Typography.Title>
      <Row>
        <Col xs={24} xl={10} xxl={8}>
          <ProjectForm />
        </Col>
      </Row>
    </Flex>
  )
}