'use client';;
import { Button, Drawer, Flex, Form, message, notification } from "antd";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import NewCaptionForm from "../NewCaptionForm/NewCaptionForm";
import { getUserId } from "@/helpers/user";
import useProjectId from "@/hooks/useProjectId";
import axios from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewCaptionDrawer = ({ open, onClose }: Props) => {
  const projectId = useProjectId();
  const [form] = Form.useForm();

  const writeCaption = async (values: any) => {
    try {
      axios.post('/api/write/caption', values)
      message.success('Caption added in the queue!');
      onClose();
      form.resetFields()
    } catch {
      notification.error({
        message: "We had an issue adding your caption in the queue please try again",
        placement: "bottomRight",
        role: "alert",
      })
    }
  }

  const onFinish = async (values: any) => {
    await writeCaption({
      ...values,
      user_id: await getUserId(),
      project_id: projectId
    });
    return;
  };

  return (
    <Drawer
      title={<DrawerTitle title="New caption" />}
      width={600}
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
            loading={false}
            disabled={false}
          >
            Write caption (2 credits)
          </Button>
        </Flex>
      }
    >
      <NewCaptionForm
        form={form}
        onSubmit={onFinish}
      />
    </Drawer>
  )
}

export default NewCaptionDrawer