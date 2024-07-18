'use client';;
import { Button, Drawer, Flex, Form, message, notification } from "antd";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import NewKnowledgeForm from "../NewKnowledgeForm/NewKnowledgeForm";
import useKnowledges from "@/hooks/useKnowledges";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewKnowledgeDrawer = ({ open, onClose }: Props) => {
  const [form] = Form.useForm();
  const { create: createKnowledge } = useKnowledges();

  const scheduleKnowledgeTraining = async (data: {
    mode: "text";
    text: string;
  } | {
    mode: "url";
    urls: string[];
  } | {
    mode: "url";
    files: any[];
  }) => {
    await createKnowledge.mutateAsync(data)
  }

  const onFinish = async (values: any) => {
    try {
      if (values.mode === "text") {
        await scheduleKnowledgeTraining({
          mode: values.mode,
          text: values.text
        });
      }
      if (values.mode === "url") {
        await scheduleKnowledgeTraining({
          mode: values.mode,
          urls: values.sitemap ? values.urls : [values.url]
        });
      }
      if (values.mode === "file") {
        await scheduleKnowledgeTraining({
          mode: values.mode,
          files: values.files
        });
      }

      message.success('Knowledge added for training!');
      onClose();
      form.resetFields()
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