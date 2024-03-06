import useProjects from "@/hooks/useProjects";
import useProjectId from "@/hooks/useProjectId";
import { Button, Flex, Form, Image, Input, Popconfirm, Select, Space } from "antd";
import { useRouter } from "next/navigation";
import useLanguages from "@/hooks/useLanguages";

const ProjectForm = () => {
  const projectId = useProjectId();
  const { getOne, update, delete: deleteProject } = useProjects()
  const { data: project } = getOne(projectId)
  // const form = useProjectForm(project);
  const [form] = Form.useForm();
  const router = useRouter()
  const { data: languages } = useLanguages().getAll()

  // if (projectId === null || tab !== "settings") {
  //   return null;
  // }

  if (!project) {
    return null;
  }

  // const onDeleteProject = () => {
  //   modals.openConfirmModal({
  //     title: <Text size="xl" fw="bold">Delete project</Text>,
  //     withCloseButton: false,
  //     labels: {
  //       cancel: 'Cancel',
  //       confirm: 'Confirm'
  //     },
  //     onConfirm() {
  //       deleteProject.mutate(projectId);
  //       notifications.show({
  //         title: 'All good!',
  //         message: 'Your project was deleted.',
  //         color: 'green',
  //         icon: <IconCheck size="1rem" />
  //       })
  //       // router.replace('/projects')
  //     },
  //     confirmProps: {
  //       color: 'red'
  //     },
  //     children: (
  //       <Text size="sm">Are you sure you want to delete <b>{project?.name}</b>?</Text>
  //     )
  //   })
  // }

  // const onSubmit = async (values) => {
  //   try {
  //     await update.mutateAsync({
  //       ...values,
  //       project_id: projectId
  //     })
  //     notifications.show({
  //       message: 'Project updated.',
  //       color: 'green',
  //       icon: <IconCheck size="1rem" />
  //     })

  //   } catch (e) {
  //     console.error(e)
  //     notifications.show({
  //       message: 'Project not updated.',
  //       color: 'red',
  //       icon: <IconX size="1rem" />
  //     })
  //   }
  // }


  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={() => { }}
      // labelCol={{ span: 8 }}
      // wrapperCol={{ span: 20 }}
      // style={{ maxWidth: 600 }}
      initialValues={{
        name: project.name,
        website: project.website,
        description: project?.description?.slice?.(0, 250) || project?.metatags?.description?.slice?.(0, 250),
        seed_keyword: project.seed_keyword,
        language_id: project.language_id,
      }}
    >

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

      <Form.Item name="name" label="Name" rules={[{ required: true, type: "string", max: 50, message: "Enter a project name" }]} hasFeedback>
        <Input placeholder="Name" count={{ show: true, max: 50 }} />
      </Form.Item>

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
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: false, type: "string", max: 250 }]}
        hasFeedback
      >
        <Input.TextArea
          placeholder="Description"
          autoSize={{ minRows: 3, maxRows: 5 }}
          count={{
            show: true,
            max: 250,
          }}
        />
      </Form.Item>

      <Form.Item style={{ marginTop: 42 }}>
        <Flex justify="end" gap="middle">
          <Popconfirm
            title="Delete project"
            description={`Are you sure to delete this project?`}
            onConfirm={(e) => {
              e?.preventDefault()
              deleteProject.mutate(projectId)
              router.replace("/projects?tab=articles")
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
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );

}

export default ProjectForm;