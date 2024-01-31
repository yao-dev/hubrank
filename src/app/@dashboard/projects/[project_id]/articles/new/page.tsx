'use client';
import NewArticleForm from "@/components/NewArticleDrawer/NewArticleForm";
import { Button, Col, Row } from "antd";
import { useRouter } from "next/navigation";
import { ArrowLeftOutlined } from '@ant-design/icons';

const NewArticle = () => {
  const router = useRouter();

  return (
    <Row>
      <Col span={8}>
        <Button onClick={() => router.back()} icon={<ArrowLeftOutlined />}>Back</Button>
      </Col>
      <Col span={8}>
        <NewArticleForm />
      </Col>
    </Row>
  )
}

export default NewArticle