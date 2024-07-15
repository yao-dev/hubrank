'use client';;
import { Button, Drawer, Flex, Form, message, notification } from "antd";
import DrawerTitle from "../DrawerTitle/DrawerTitle";
import { getUserId } from "@/helpers/user";
import useProjectId from "@/hooks/useProjectId";
import axios from "axios";
import { getShouldShowPricing } from "@/helpers/pricing";
import usePricingModal from "@/hooks/usePricingModal";
import NewKnowledgeForm from "../NewKnowledgeForm/NewKnowledgeForm";

type Props = {
  open: boolean;
  onClose: () => void;
}

const NewKnowledgeDrawer = ({ open, onClose }: Props) => {
  const projectId = useProjectId();
  const [form] = Form.useForm();
  const pricingModal = usePricingModal();

  const writeKnowledge = async (values: any) => {
    try {
      axios.post('/api/write/knowledge', values)
      message.success('Knowledge added in the queue!');
      onClose();
      form.resetFields()
    } catch (e) {
      if (getShouldShowPricing(e)) {
        pricingModal.open(true);
      } else {
        notification.error({
          message: "We had an issue adding your knowledge in the queue please try again",
          placement: "bottomRight",
          role: "alert",
        })
      }
    }
  }

  const onFinish = async (values: any) => {
    await writeKnowledge({
      ...values,
      user_id: await getUserId(),
      project_id: projectId
    });
    return;
  };

  return (
    <Drawer
      title={<DrawerTitle title="New knowledge" />}
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
            Write knowledge (0.5 credit)
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