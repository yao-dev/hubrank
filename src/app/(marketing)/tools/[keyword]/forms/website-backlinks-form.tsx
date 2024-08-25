"use client"
import { Button, Form, Input } from "antd";
import Label from "@/components/Label/Label";

const WebsiteBacklinksForm = () => {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      disabled={false}
      initialValues={{
        website_url: "",
        email: ""
      }}
      autoComplete="off"
      layout="vertical"
      onFinish={console.log}
      scrollToFirstError
      size="large"
    >
      <Form.Item
        name="website_url"
        label={<Label name="Website url" />}
        validateTrigger={['onChange', 'onBlur']}
        rules={[{ required: true, message: 'Please enter a valid url', type: "url" }]}
      >
        <Input placeholder="Website url" />
      </Form.Item>

      <Form.Item label={<Label name="Email" />} name="email" validateTrigger="onSubmit" rules={[{ required: true, type: "email", message: "Required" }]}>
        <Input size="large" placeholder="Enter your email" autoComplete="on" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" className="w-full">Get backlinks ✨</Button>
      </Form.Item>
    </Form>
  )
}

export default WebsiteBacklinksForm;