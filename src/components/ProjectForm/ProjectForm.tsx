import useProjects from "@/hooks/useProjects";
import useProjectId from "@/hooks/useProjectId";
import { Button, Flex, Form, Input, Popconfirm, message } from "antd";
import { useRouter } from "next/navigation";
import useLanguages from "@/hooks/useLanguages";
import Label from "../Label/Label";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import queryKeys from "@/helpers/queryKeys";
import { getUserId } from "@/helpers/user";
import { useState } from "react";
import LanguageSelect from "../LanguageSelect/LanguageSelect";
import useActiveProject from "@/hooks/useActiveProject";

const ProjectForm = () => {
  const projectId = useProjectId();
  const { getOne, delete: deleteProject } = useProjects()
  const { data: project } = getOne(projectId)
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const router = useRouter()
  const { data: languages } = useLanguages().getAll();
  const [isSaving, setIsSaving] = useState(false)
  const activeProject = useActiveProject()

  if (!project) {
    return null;
  }

  const onSubmit = async (values: any) => {
    try {
      setIsSaving(true)
      const userId = await getUserId()
      await axios.put('/api/project', {
        ...values,
        blog_path: values.blog_path.endsWith("/") ? values.blog_path : `${values.blog_path}/`,
        project_id: projectId,
        user_id: userId
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects(projectId),
      });
      message.success("Project updated!");
      setIsSaving(false)
    } catch (e) {
      setIsSaving(false)
      console.log(e);
      message.error("We are unable to save your update!")
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      disabled={isSaving}
      // labelCol={{ span: 8 }}
      // wrapperCol={{ span: 20 }}
      // style={{ maxWidth: 600 }}
      initialValues={{
        name: project.name,
        website: project.website,
        description: project?.description?.slice?.(0, 700) || project?.metatags?.description?.slice?.(0, 700),
        // seed_keyword: project.seed_keyword,
        language_id: project.language_id,
        sitemap: project.sitemap ?? "",
        blog_path: project.blog_path ?? "",
      }}
      scrollToFirstError
    >
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

      <Form.Item name="name" label={<Label name="Name" />} rules={[{ required: true, type: "string", max: 50, message: "Enter a project name" }]} >
        <Input placeholder="Name" count={{ show: true, max: 50 }} />
      </Form.Item>

      <Form.Item
        name="website"
        label={<Label name="Website" />}
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
      >
        <Input placeholder="https://google.com" />
      </Form.Item>
      <Form.Item
        name="description"
        label={<Label name="Description" />}
        rules={[{ required: false, type: "string", max: 700 }]}

      >
        <Input.TextArea
          placeholder="Description"
          autoSize={{ minRows: 3, maxRows: 8 }}
          count={{
            show: true,
            max: 700,
          }}
        />
      </Form.Item>

      <Form.Item
        name="blog_path"
        label={<Label name="Blog url" />}
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
      >
        <Input placeholder="ex: /, /blog" />
      </Form.Item>

      <Form.Item name="sitemap" label={<Label name="Sitemap" />} rules={[{ required: false, type: "url", message: "Enter a valid sitemap url" }]} >
        <Input placeholder="Sitemap" />
      </Form.Item>

      <Form.Item style={{ marginTop: 42 }}>
        <Flex justify="end" gap="middle">
          <Popconfirm
            title="Delete project"
            description={`Are you sure to delete this project?`}
            onConfirm={(e) => {
              e?.preventDefault()
              deleteProject.mutate(projectId)
              router.replace("/")
              activeProject.setProjectId(0);
              message.success('Your project was deleted.')
            }}
            onCancel={(e) => {
              e?.preventDefault()
            }}
            okText="Yes"
            cancelText="No"
            okButtonProps={{
              danger: true
            }}
          >
            <Button danger type="text">Delete project</Button>
          </Popconfirm>
          <Button loading={isSaving} type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );

}

export default ProjectForm;