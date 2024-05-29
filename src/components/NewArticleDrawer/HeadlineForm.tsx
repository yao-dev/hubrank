'use client';;
import { getUserId } from "@/helpers/user";
import useProjectId from "@/hooks/useProjectId";
import { Button, Card, Flex, Form, Radio, message, notification } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

const HeadlineForm = ({
  form,
  isLocked,
  setLockedStep,
  submittingStep,
  setCurrentStep,
  headlines,
  prev,
  values
}: any) => {
  const router = useRouter();
  const projectId = useProjectId();

  const writeArticle = async (values: any) => {
    try {
      message.success('Article added in the queue!');
      router.replace(`/projects/${projectId}?tab=articles`)
      axios.post('/api/write', values)
    } catch {
      notification.error({
        message: "We had an issue adding your article in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  }

  const onFinish = async () => {
    // setCurrentStep(2)
    setLockedStep(1);
    await writeArticle({
      ...values,
      purpose: values.purpose.replaceAll("_", " "),
      tone: values.tones?.join?.(","),
      content_type: values.content_type.replaceAll("_", " "),
      clickbait: !!values.clickbait,
      userId: await getUserId(),
      // featuredImage,
      // sectionImages
    });
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