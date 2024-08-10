'use client';;
import ProjectForm from "@/components/ProjectForm/ProjectForm";

import { Col, Flex, Row, Typography } from "antd";

export default function ProjectSettings() {
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