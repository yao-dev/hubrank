import useProjectId from "@/hooks/useProjectId";
import useWritingStyles from "@/hooks/useWritingStyles";
import { Alert, App, Flex, Form, Input, Modal, Switch } from "antd";
import { useEffect } from "react";

const options = [
  {
    value: "text",
    label: "Text",
  },
  {
    value: "url",
    label: "Url",
  },
]

type Props = {
  opened: boolean;
  setModalOpen: (open: boolean) => void
}

const WritingStyleForm = ({ opened, setModalOpen }: Props) => {
  const projectId = useProjectId();
  const [form] = Form.useForm();
  const { create, getAll } = useWritingStyles()
  const { data: writingStyles } = getAll();
  const { message, notification } = App.useApp();

  useEffect(() => {
    if (!writingStyles?.count) {
      form.setFieldValue("default", true)
    }
  }, [writingStyles]);

  const onSubmit = async (values: any) => {
    try {
      await create.mutateAsync({
        ...values,
        source_type: "text",
        project_id: projectId,
      })
      onClose()
      message.success('Writing style created!');
    } catch {
      notification.error({
        message: "We had an issue creating a new writing style please try again",
        placement: "bottomRight",
        role: "alert",
        duration: 5,
      })
    }
  }

  const onClose = () => {
    setModalOpen(false);
    form.resetFields();
  }

  return (
    <Modal
      title="Add writing style"
      open={opened}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={create.isLoading}
    >
      <Flex vertical gap="large">
        <Form
          disabled={create.isLoading}
          form={form}
          initialValues={{
            name: "",
            source_value: "",
            default: false
          }}
          layout="vertical"
          onFinish={onSubmit}

        >
          <Form.Item>
            <Alert message="Create your own writing style by giving us an example of writing you want to replicate." type="info" showIcon />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name"
            rules={[{
              required: true,
              type: "string",
              message: "Enter a name",
            }]}
            hasFeedback
          >
            <Input placeholder="Name" />
          </Form.Item>

          {/* <Form.Item name="source_type" label="Source type" rules={[{ required: true, type: "string", message: "Select a source type" }]} hasFeedback>
            <Select
              showSearch
              placeholder="Select a source type"
              options={options}
            />
          </Form.Item> */}

          <Form.Item
            name="source_value"
            rules={[{ required: true, message: 'Please enter a text', type: "string", max: 750 }]}
            hasFeedback
          >
            <Input.TextArea
              placeholder="Type anything"
              count={{ show: true, max: 750 }}
              autoSize={{ minRows: 5, maxRows: 8 }}
            />
          </Form.Item>

          {/* <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.source_type !== currentValues.source_type}
          >
            {({ getFieldValue }) => {
              return getFieldValue('source_type') === "text" ? (
                <Form.Item
                  name="source_text"
                  rules={[{ required: true, message: 'Please enter a text', type: "string", max: 1000 }]}
                  hasFeedback
                >
                  <Input.TextArea
                    placeholder="Type anything"
                    count={{ show: true, max: 1000 }}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name="source_url"
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
                  <Input placeholder="https://www.youtube.com/watch?v=dfkns" />
                </Form.Item>
              );
            }}
          </Form.Item> */}

          <Form.Item name="default" rules={[]} hasFeedback>
            <Flex gap="small">
              <Switch />
              <span>Set as default</span>
            </Flex>
          </Form.Item>
        </Form>
      </Flex>
    </Modal>
  )
}

export default WritingStyleForm;