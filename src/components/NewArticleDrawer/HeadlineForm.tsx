'use client';
import { Card, Flex, Form, Radio } from "antd";

const HeadlineForm = ({
  form,
  isLocked,
  setLockedStep,
  submittingStep,
  setCurrentStep,
  headlines,
}) => {

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
    </Form>
  )
}

const styles = {
  radioGroup: { width: "100%" },
  card: { width: "100%", cursor: "pointer" },
  bodyStyle: { padding: 10 }
}

export default HeadlineForm