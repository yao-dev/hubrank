'use client';;
import { Button, Card, Flex, Form, Radio } from "antd";

const HeadlineForm = ({
  form,
  isLocked,
  setLockedStep,
  submittingStep,
  setCurrentStep,
  headlines,
  prev
}: any) => {

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
      style={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        flex: 1,
      }}
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

      <Form.Item style={{ marginBottom: 0 }}>
        <Flex justify="end" align="center" gap="middle">
          <Button disabled={submittingStep !== undefined || !submittingStep && isLocked && false} onClick={() => prev()}>
            Previous
          </Button>

          <Button onClick={() => form.submit()} type="primary" htmlType="button" loading={submittingStep === 1} disabled={isLocked ? false : undefined}>
            Next
          </Button>
        </Flex>
        {/* <ShowCoinsForAction value="0.10" style={{ marginTop: 12 }} /> */}
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