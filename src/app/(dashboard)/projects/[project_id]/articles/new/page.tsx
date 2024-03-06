'use client';;
import NewArticleForm from "@/components/NewArticleDrawer/NewArticleForm";
import { Col, Row, Grid } from "antd";

const { useBreakpoint } = Grid

const NewArticle = () => {
  const screens = useBreakpoint();

  return screens.lg ? (
    <Row>
      <Col span={9}>
        <NewArticleForm />
      </Col>
    </Row>
  ) :
    <NewArticleForm />
}

export default NewArticle