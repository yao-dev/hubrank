import { Text } from "@mantine/core";
import useProjects from "@/hooks/useProjects";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import useProjectId from "@/hooks/useProjectId";
import { Button, Form, Input } from "antd";

const ProjectForm = () => {
  const projectId = useProjectId();
  const { getOne, update, delete: deleteProject } = useProjects()
  const { data: project } = getOne(projectId)
  // const form = useProjectForm(project);
  const [form] = Form.useForm();

  // if (projectId === null || tab !== "settings") {
  //   return null;
  // }

  if (!project) {
    return null;
  }

  const onDeleteProject = () => {
    modals.openConfirmModal({
      title: <Text size="xl" fw="bold">Delete project</Text>,
      withCloseButton: false,
      labels: {
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      onConfirm() {
        deleteProject.mutate(projectId);
        notifications.show({
          title: 'All good!',
          message: 'Your project was deleted.',
          color: 'green',
          icon: <IconCheck size="1rem" />
        })
        // router.replace('/projects')
      },
      confirmProps: {
        color: 'red'
      },
      children: (
        <Text size="sm">Are you sure you want to delete <b>{project?.name}</b>?</Text>
      )
    })
  }

  const onSubmit = async (values) => {
    try {
      await update.mutateAsync({
        ...values,
        project_id: projectId
      })
      notifications.show({
        message: 'Project updated.',
        color: 'green',
        icon: <IconCheck size="1rem" />
      })

    } catch (e) {
      console.error(e)
      notifications.show({
        message: 'Project not updated.',
        color: 'red',
        icon: <IconX size="1rem" />
      })
    }
  }


  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={() => { }}
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 20 }}
      style={{ maxWidth: 600 }}
      initialValues={{
        name: project.name,
        website: project.website,
        description: project.description,
        seed_keyword: project.seed_keyword,
      }}
    >
      <Form.Item name="name" label="Name" rules={[{ required: true, type: "string", max: 50, message: "Enter a project name" }]} hasFeedback>
        <Input placeholder="Name" count={{ show: true, max: 50 }} />
      </Form.Item>
      <Form.Item name="seed_keyword" label="Seed keyword" rules={[{ required: true, type: "string", max: 75, message: "Add a seed keyword" }]} hasFeedback>
        <Input placeholder="Seed keyword" count={{ show: true, max: 75 }} />
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
        rules={[{ required: false, type: "string", max: 200 }]}
        hasFeedback
      >
        <Input placeholder="Description" count={{ show: true, max: 200 }} />
      </Form.Item>

      <Form.Item />

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Update
        </Button>
      </Form.Item>
    </Form>
  );

}

export default ProjectForm;