'use client';
import { Button, Card, Flex, Form, Radio } from "antd";
import { useEffect } from "react";

const HeadlineForm = ({
  form,
  isLocked,
  setLockedStep,
  submittingStep,
  setCurrentStep,
  headlines,
  prev
}) => {

  useEffect(() => {
    const headlineForm = document.getElementById("headline-form");
    headlineForm.addEventListener('submit', (e) => e.preventDefault());
  }, [])

  const onFinish = () => {
    setCurrentStep(2)
    setLockedStep(1);
  };

  // if (isLoading) {
  //   return (
  //     <>
  //       <Flex gap="small">
  //         <Spin />
  //         <Typography.Text>We are getting some headline ideas for you</Typography.Text>
  //       </Flex>
  //       <Skeleton />
  //     </>
  //   )
  // }

  return (
    <Form
      form={form}
      name="headline-form"
      disabled={submittingStep !== undefined || isLocked}
      initialValues={{
        title: ""
      }}
      autoComplete="off"
      layout="vertical"
      onFinish={onFinish}
      onSubmitCapture={e => e.preventDefault()}
    >
      <Form.Item name="title" required rules={[{ required: true, type: "string", message: "Select a title" }]}>
        <Radio.Group style={styles.radioGroup}>
          <Flex vertical gap="small">
            {headlines.map((item) => {
              return (
                <Card
                  key={item.id}
                  style={styles.card}
                  bodyStyle={styles.bodyStyle}
                >
                  <Radio value={item.headline}>{item.headline}</Radio>
                </Card>
              )
            })}
          </Flex>
        </Radio.Group>
      </Form.Item>

      <Form.Item>
        <Flex justify="end" align="center" gap="middle">
          <Button disabled={submittingStep !== undefined} onClick={() => prev()}>
            Previous
          </Button>

          <Button onClick={() => form.submit()} type="primary" htmlType="button" loading={submittingStep === 1}>
            Next
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  )
}

const styles = {
  radioGroup: { width: "100%" },
  card: { width: "100%", cursor: "pointer" },
  bodyStyle: { padding: 10 }
}

export default HeadlineForm