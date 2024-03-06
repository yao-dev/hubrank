'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import useProjects from "@/hooks/useProjects";
import { Image, Form, Input, Modal, Alert, Select, Space } from "antd";
import useLanguages from "@/hooks/useLanguages";


const NewProjectModal = ({ opened, onClose }: any) => {
  const [error, setError] = useState(false);
  const router = useRouter()
  const projects = useProjects();

  const [form] = Form.useForm();
  const { data: languages } = useLanguages().getAll()

  const onCreateProject = async (values: any) => {
    try {
      setError(false)
      const { data: project } = await projects.create.mutateAsync({
        ...values,
        language_id: +values.language_id
      });
      onCloseCreateProject()
      router.push(`/projects/${project.id}/articles`)
    } catch (e) {
      console.error(e)
      setError(true)
    }
  }

  const onCloseCreateProject = () => {
    onClose(false);
    form.resetFields();
  }

  return (
    <Modal
      title="New project"
      open={opened}
      onCancel={() => onCloseCreateProject()}
      onOk={() => form.submit()}
      okText="Create"
      confirmLoading={projects.create.isPending}
      closable={!projects.create.isPending}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onCreateProject}
        initialValues={{
          name: "",
          website: "",
          // description: "",
          // seed_keyword: "",
          // target_audience: "",
          language_id: null
        }}
      >
        {error && (
          <Alert message="Something went wrong! Try again please." type="error" showIcon style={{ marginBottom: 12 }} />
        )}
        <Form.Item name="name" label="Name" rules={[{ required: true, type: "string", max: 50, message: "Enter a project name" }]} hasFeedback>
          <Input placeholder="Name" count={{ show: true, max: 50 }} />
        </Form.Item>

        <Form.Item
          name="language_id"
          label="Language"
          rules={[{
            required: true,
            type: "number",
            message: "Select a language"
          }]}
          hasFeedback
        >
          <Select
            placeholder="Language"
            optionLabelProp="label"
            options={languages?.map((p) => {
              return {
                ...p,
                label: p.label,
                value: p.id
              }
            })}
            optionRender={(option: any) => {
              return (
                <Space>
                  <Image
                    src={option.data.image}
                    width={25}
                    height={25}
                    preview={false}
                  />
                  {option.label}
                </Space>
              )
            }}
          />
        </Form.Item>
        {/*
      <Form.Item name="seed_keyword" label="Main keyword" rules={[{ required: true, type: "string", max: 75, message: "Add a main keyword" }]} hasFeedback>
        <Input placeholder="Main keyword" count={{ show: true, max: 75 }} />
      </Form.Item> */}

        <Form.Item
          name="website"
          label="Website"
          validateTrigger="onBlur"
          rules={[{
            required: true,
            type: "url",
            message: "Enter a valid url",
            transform: (url: any) => {
              if (!url?.startsWith('https://')) {
                url = `https://${url}`
              }
              return new URL(url).origin
            }
          }]}
          hasFeedback
        >
          <Input placeholder="https://google.com" />
        </Form.Item>
        {/* <Form.Item
        name="description"
        label="Description"
        help="We'll try to get the value from the meta description of your website"
        rules={[{
          required: false,
          type: "string",
          max: 200,
        }]}
        hasFeedback
      >
        <Input placeholder="Description" count={{ show: true, max: 200 }} />
      </Form.Item> */}
        {/*
      <Form.Item name="target_audience" label="Target audience" rules={[{ required: true, type: "string", max: 150 }]}>
        <Input placeholder="Target audience" count={{ show: true, max: 150 }} />
      </Form.Item> */}
      </Form>
    </Modal>
  )
}

export default NewProjectModal;