"use client"
import { Button, Form, Input } from "antd";
import Label from "@/components/Label/Label";

type FormValues = {
  topic: string;
  email: string;
}

const HeadlineForm = () => {
  const [form] = Form.useForm();

  return (
    <Form<FormValues>
      form={form}
      disabled={false}
      // initialValues={{
      //   topic: "",
      //   email: ""
      // }}
      autoComplete="off"
      layout="vertical"
      onFinish={console.log}
      scrollToFirstError
      size="large"
    >
      <Form.Item
        name="topic"
        label={<Label name="Enter your topic or keyword" />}
        rules={[{ type: "string", max: 50, required: true, message: "Add a topic or keyword" }]}

      >
        <Input
          placeholder="Enter a topic"
          allowClear
          count={{
            show: false,
            max: 50,
          }}
        />
      </Form.Item>

      <Form.Item label={<Label name="Email" />} name="email" validateTrigger="onSubmit" rules={[{ required: true, type: "email", message: "Required" }]}>
        <Input size="large" placeholder="Enter your email" autoComplete="on" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" className="w-full">Get headlines ✨</Button>
      </Form.Item>
    </Form>
  )
}

export default HeadlineForm;