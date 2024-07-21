'use client';;
import { Button, Drawer, Flex, Form, message, notification } from "antd";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import NewKnowledgeForm from "../NewKnowledgeForm/NewKnowledgeForm";
import useKnowledges from "@/hooks/useKnowledges";
import useProjectId from "@/hooks/useProjectId";
import { getUserId } from "@/helpers/user";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewKnowledgeDrawer = ({ open, onClose }: Props) => {
  const [form] = Form.useForm();
  const { create: createKnowledge } = useKnowledges();
  const isSitemap = Form.useWatch("is_sitemap", form);
  const urls = Form.useWatch("urls", form);
  const projectId = useProjectId();

  const scheduleKnowledgeTraining = async (data: {
    mode: "text" | "url" | "file";
    content: string | string[];
    user_id: string,
    project_id: number,
    type: "txt" | "url" | "csv" | "doc" | "pdf" | "json" | "html",
  } | {
    mode: "text" | "url" | "file";
    content: string | string[];
    user_id: string,
    project_id: number,
    type: "txt" | "url" | "csv" | "doc" | "pdf" | "json" | "html",
  }[]) => {
    await createKnowledge.mutateAsync(data)
  }

  const onFinish = async (values: any) => {
    try {
      const userId = await getUserId();

      if (values.mode === "text") {
        scheduleKnowledgeTraining({
          mode: values.mode,
          content: values.text,
          user_id: userId,
          project_id: projectId,
          type: "txt",
        });
      }
      if (values.mode === "url") {
        const urlsField = form.getFieldValue("urls");

        if (values.is_sitemap && !urlsField?.length) {
          return message.error('You must select at least one url');
        }
        const urls = values.is_sitemap ? urlsField : [values.url];

        const data = urls.map((url: string) => {
          return {
            mode: values.mode,
            content: url,
            user_id: userId,
            project_id: projectId,
            type: "url",
          }
        })
        scheduleKnowledgeTraining(data);
      }
      if (values.mode === "file") {
        // TODO: handle files
      }

      onClose();
      form.resetFields();
      message.success('Your knowledge will be trained in the background');
    } catch (e) {
      console.error(e);
      notification.error({
        message: "We had an issue adding your knowledge for training please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  };

  return (
    <Drawer
      title={<DrawerTitle title="New knowledge" />}
      width={800}
      onClose={() => {
        onClose();
        form.resetFields()
      }}
      open={open}
      destroyOnClose
      styles={{
        body: {
          paddingBottom: 80,
        },
      }}
      footer={
        <Flex justify="end" align="center" gap="middle">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => form.submit()}
            type="primary"
            loading={createKnowledge.isPending}
            disabled={createKnowledge.isPending}
          >
            Add
          </Button>
        </Flex>
      }
    >
      <NewKnowledgeForm
        form={form}
        onSubmit={onFinish}
      />
    </Drawer>
  )
}

export default NewKnowledgeDrawer