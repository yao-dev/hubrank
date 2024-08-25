"use client";
import { ReactNode, useState } from "react";
import { Alert, Button, Form, Input, message, Select } from "antd";
import Label from "@/components/Label/Label";
import { headingsCount, headlineTypes } from "@/options";
import axios from "axios";
import GoogleSignInButton from "@/components/GoogleSignInButton/GoogleSignInButton";
import { useReCaptcha } from "next-recaptcha-v3";

type Props = {
  name: "hashtags" | "headlines" | "content_ideas" | "meta_description" | "backlink_checker" | "outline";
  children: ReactNode;
  submitText?: string
}

const ToolForm = ({ children, name, submitText }: Props) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [data, setData] = useState();
  const { executeRecaptcha } = useReCaptcha();

  const onSubmit = async (values: any) => {
    try {
      setIsRateLimited(false);
      setIsSubmitting(true);

      const token = await executeRecaptcha(`form_${name}`);
      const { data: recaptcha } = await axios.post("/api/recaptcha", { token });

      if (!recaptcha.success) {
        setIsSubmitting(false);
        form.resetFields();
        setIsRateLimited(true);
        return;
      }

      const { data } = await axios.post("/api/free-tools", {
        ...values,
        name,
      });

      setIsSubmitting(false);
      form.resetFields();

      if (data?.rateLimitState?.remaining <= 0) {
        setIsRateLimited(true);
      } else {
        setData(data)
      }
    } catch (e) {
      console.log(e);
      setIsSubmitting(false);
      message.error("Something went wrong, please try again.")
    }
  }

  return (
    <div className="flex flex-col gap-20">
      <div className="md:px-0 md:w-2/3 xl:w-1/2 mx-auto">
        <div className="border rounded-lg shadow-xl p-10">
          <Form
            form={form}
            disabled={isSubmitting}
            autoComplete="off"
            layout="vertical"
            onFinish={onSubmit}
            scrollToFirstError
            size="large"
          >
            {children}

            <Form.Item className="mt-10">
              <Button loading={isSubmitting} onClick={() => form.submit()} type="primary" className="w-full">{submitText ?? "Submit ✨"}</Button>
            </Form.Item>

            {isRateLimited && (
              <>
                <Form.Item>
                  <Alert
                    message={<Label name="Daily limit reached" />}
                    description="You've reached your daily limit, create an account for unlimited usage."
                    type="error"
                    showIcon
                    className="font-normal"
                  />
                </Form.Item>

                <Form.Item>
                  <GoogleSignInButton name="Log in with Google" />
                </Form.Item>
              </>
            )}
          </Form>
        </div>
      </div>

      {/* TODO show data/result here */}
    </div>
  )
}

export const InputTopic = () => (
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
)

export const InputEmail = () => (
  <Form.Item label={<Label name="Email" />} name="email" validateTrigger="onSubmit" rules={[{ required: true, type: "email", message: "Enter your email" }]}>
    <Input size="large" placeholder="Enter your email" autoComplete="on" />
  </Form.Item>
)

export const InputHeadings = () => (
  <Form.Item name="headings" label={<Label name="Headings" />} rules={[{ required: true, type: "string", message: "Select headings" }]} >
    <Select
      placeholder="How many headings?"
      options={headingsCount}
      optionLabelProp="label"
    />
  </Form.Item>
)

export const InputHeadlineType = () => (
  <Form.Item name="headline_type" label={<Label name="Headline type" />} rules={[{ required: true, type: "string", message: "Select a type" }]} >
    <Select
      placeholder="Headline type"
      options={headlineTypes}
      optionLabelProp="label"
    />
  </Form.Item>
)

export const InputWebsiteUrl = () => (
  <Form.Item
    name="website_url"
    label={<Label name="Website url" />}
    validateTrigger={['onChange', 'onBlur']}
    rules={[{ required: true, message: 'Please enter a valid url', type: "url" }]}
  >
    <Input placeholder="Website url" />
  </Form.Item>
)

export default ToolForm;