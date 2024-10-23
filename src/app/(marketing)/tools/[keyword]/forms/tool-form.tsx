"use client";
import { ReactNode, useState } from "react";
import { Alert, Button, Form, Image, Input, message, Select, Skeleton } from "antd";
import Label from "@/components/Label/Label";
import { headingsCount, headlineTypes } from "@/options";
import axios from "axios";
import GoogleSignInButton from "@/components/GoogleSignInButton/GoogleSignInButton";
import { useReCaptcha } from "next-recaptcha-v3";
import { IconCopy, IconHash } from "@tabler/icons-react";
import TiptapEditor from "@/app/app/(dashboard)/projects/[project_id]/articles/[article_id]/TiptapEditor/TiptapEditor";

type Props = {
  name: "hashtags" | "headlines" | "content_ideas" | "meta_description" | "backlink_checker" | "outline" | "website_competitors";
  children: ReactNode;
  submitText?: string;
  initialValues?: any
}

const ToolForm = ({ children, name, submitText, initialValues = {} }: Props) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [data, setData] = useState([]);
  const { executeRecaptcha } = useReCaptcha();

  const onSubmit = async (values: any) => {
    try {
      setIsRateLimited(false);
      setIsSubmitting(true);
      setData([]);

      const token = await executeRecaptcha(`form_${name}`);
      const { data: recaptcha } = await axios.post("/api/recaptcha", { token });

      if (!recaptcha.success) {
        setIsSubmitting(false);
        form.resetFields();
        setIsRateLimited(true);
        return;
      }

      const response = await axios.post("/api/free-tools", {
        ...values,
        name,
      });

      setIsSubmitting(false);
      form.resetFields();

      if (response?.data?.rateLimitState?.remaining <= 0) {
        setIsRateLimited(true);
      } else {
        setData(response?.data ?? {})
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
            initialValues={initialValues}
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

      {isSubmitting && (
        <Skeleton active loading />
      )}

      {name === "outline" && (
        <div className="text-normal">
          {data.map((item) => {
            return (
              <div className="flex justify-center">
                <div key={item} className="relative p-4 border rounded-lg w-fit overflow-hidden">
                  <TiptapEditor
                    articleId={0}
                    content={item}
                    readOnly
                  />

                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(item);
                      message.success("Copied to clipboard!");
                    }}
                    className="absolute z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-primary-500/70 cursor-pointer transition-all"
                  >
                    <IconCopy stroke={1.2} className="w-10 h-10" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}


      {name === "website_competitors" && (
        <div className="grid grid-cols-2 gap-4 text-normal">
          {data.map((item) => {
            return (
              <div>
                <div key={item.target} className="relative p-4 border rounded-lg overflow-hidden">
                  <div className="flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-row items-center gap-4">
                      <Image
                        src={`https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${item.target}&size=128`}
                        width={20}
                        height={20}
                        preview={false}
                      />
                      <p className="p-4">
                        {item.target}
                      </p>
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <IconHash />
                      <p>{item.rank}</p>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(item.target);
                      message.success("Copied to clipboard!");
                    }}
                    className="absolute z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-primary-500/70 cursor-pointer transition-all"
                  >
                    <IconCopy stroke={1.2} className="w-10 h-10" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TODO show data/result here per form type */}
      {name !== "outline" && name !== "website_competitors" && (
        <div className="grid grid-cols-2 gap-4 text-normal">
          {data.map((item) => {
            return (
              <div>
                <div key={item} className="relative p-4 border rounded-lg overflow-hidden">
                  <p className="p-4">
                    {item}
                  </p>

                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(item);
                      message.success("Copied to clipboard!");
                    }}
                    className="absolute z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-primary-500/70 cursor-pointer transition-all"
                  >
                    <IconCopy stroke={1.2} className="w-10 h-10" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export const InputTopic = () => (
  <Form.Item
    name="topic"
    label={<Label name="Enter your topic or keyword" />}
    rules={[{ type: "string", max: 100, required: true, message: "Add a topic or keyword" }]}

  >
    <Input
      placeholder="Enter a topic"
      allowClear
      count={{
        show: true,
        max: 100,
      }}
    />
  </Form.Item>
)

export const InputDescription = () => (
  <Form.Item
    name="product_description"
    label={<Label name="Describe your product" />}
    rules={[{ type: "string", max: 250, required: true, message: "Add a product description" }]}

  >
    <Input
      placeholder="Enter a product description"
      allowClear
      count={{
        show: true,
        max: 250,
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

export const InputHeadlineType = (props: any = {}) => (
  <Form.Item name="headline_type" label={<Label name="Headline type" />} rules={[{ required: true, type: "string", message: "Select a type" }]} {...props} >
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