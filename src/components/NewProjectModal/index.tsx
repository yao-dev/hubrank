'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import useProjects from "@/hooks/useProjects";
import { Form, Input, Modal, Alert } from "antd";
import useLanguages from "@/hooks/useLanguages";
import Label from "../Label/Label";
import axios from "axios";
import { getUserId } from "@/helpers/user";
import { useQueryClient } from "@tanstack/react-query";
import queryKeys from "@/helpers/queryKeys";
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import ModalTitle from "../ModalTitle/ModalTitle";

const NewProjectModal = ({ opened, onClose }: any) => {
  const [error, setError] = useState(false);
  const router = useRouter()
  const projects = useProjects();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const [form] = Form.useForm();
  const { data: languages } = useLanguages().getAll();

  const transformUrl = (url: any) => {
    if (!url?.startsWith('https://')) {
      url = `https://${url}`
    }
    return new URL(url).origin
  }

  const onCreateProject = async (values: any) => {
    try {
      setError(false)
      setIsSaving(true)
      const userId = await getUserId()
      const { data } = await axios.post('/api/project', {
        ...values,
        language_id: +values.language_id,
        user_id: userId,
        website: transformUrl(values.website),
        blog_path: `${transformUrl(values.website)}/`,
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects(),
      });
      onCloseCreateProject()
      router.push(`/projects/${data.projectId}/settings`)
      setIsSaving(false)
    } catch (e) {
      setIsSaving(false)
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
      title={<ModalTitle>New project</ModalTitle>}
      open={opened}
      onCancel={() => onCloseCreateProject()}
      onOk={() => form.submit()}
      okText="Create"
      cancelButtonProps={{
        disabled: !projects.create.isPending || !isSaving
      }}
      confirmLoading={isSaving}
      closable={!projects.create.isPending && !isSaving}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onCreateProject}
        disabled={isSaving}
        initialValues={{
          name: "",
          website: "",
          // description: "",
          // seed_keyword: "",
          // target_audience: "",
          language_id: 1
        }}
      >
        {error && (
          <Alert message="Something went wrong! Try again please." type="error" showIcon style={{ marginBottom: 12 }} />
        )}
        <Form.Item name="name" label={<Label name="Name" />} rules={[{ required: true, type: "string", max: 50, message: "Enter a project name" }]} >
          <Input placeholder="Name" count={{ show: true, max: 50 }} />
        </Form.Item>

        <Form.Item
          name="language_id"
          label={<Label name="Language" />}
          rules={[{
            required: true,
            type: "number",
            message: "Select a language"
          }]}

        >
          <LanguageSelect languages={languages} />
        </Form.Item>
        {/*
      <Form.Item name="seed_keyword" label="Main keyword" rules={[{ required: true, type: "string", max: 75, message: "Add a main keyword" }]} >
        <Input placeholder="Main keyword" count={{ show: true, max: 75 }} />
      </Form.Item> */}

        <Form.Item
          name="website"
          label={<Label name="Website" />}
          validateTrigger="onBlur"
          rules={[{
            required: true,
            type: "url",
            message: "Enter a valid url",
            transform: transformUrl
          }]}

        >
          <Input addonBefore="https://" placeholder="google.com" />
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