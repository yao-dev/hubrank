'use client';;
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import {
  Button,
  Flex,
  Form,
  FormInstance,
  Input,
  Radio,
  RadioChangeEvent,
  Switch,
  Upload,
  UploadProps,
  message,
} from "antd";
import { useEffect, useState } from "react";
import useDrawers from "@/hooks/useDrawers";
import WritingStyleForm from "../WritingStyleForm/WritingStyleForm";
import Label from "../Label/Label";
import { InboxOutlined } from '@ant-design/icons';

const draggerProps: UploadProps = {
  name: 'file',
  multiple: true,
  action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};


type Props = {
  onSubmit: (values: any) => void;
  form: FormInstance<any>
}

const NewKnowledgeForm = ({ onSubmit, form }: Props) => {
  const projectId = useProjectId();
  const { data: project, isPending } = useProjects().getOne(projectId)
  const [, contextHolder] = message.useMessage();
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const drawers = useDrawers();
  const mode = Form.useWatch('mode', form);
  const withCta = Form.useWatch('with_cta', form);

  useEffect(() => {
    if (project && drawers.caption.isOpen) {
      form.setFieldValue("language_id", drawers.caption.languageId || project.language_id)
    }
  }, [project, drawers.caption.isOpen]);

  if (isPending) return null;



  return (
    <Flex vertical gap="large" style={{ height: "100%" }}>
      {contextHolder}
      <WritingStyleForm
        opened={isWritingStyleModalOpened}
        setModalOpen={setIsWritingStyleModalOpened}
      />
      <Form
        form={form}
        initialValues={{
          mode: "text",
          text: "",
          url: "",
          urls: [],
          files: [],
          sitemap: false
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onSubmit}
        onError={console.log}
      >
        <Flex gap="small" align="center" style={{ marginBottom: 12 }}>
          <Form.Item
            label={<Label name="Content type" />}
            name="mode"
            rules={[{
              required: true,
              type: "string",
              message: "Select a mode"
            }]}
            style={{ margin: 0 }}
          >
            <Radio.Group
              onChange={(e: RadioChangeEvent) => {
                form.setFieldValue("mode", e.target.value)
              }}
            >
              <Radio value="text">Text</Radio>
              <Radio value="url">Url</Radio>
              <Radio value="file">File</Radio>
            </Radio.Group>
          </Form.Item>
        </Flex>

        {mode === "text" && (
          <Form.Item
            name="text"
            label={<Label name="What do you want to write about?" />}
            rules={[{ type: "string", max: 150, required: true }]}
            hasFeedback
          >
            <Input.TextArea
              placeholder=""
              autoSize={{ minRows: 3, maxRows: 5 }}
              count={{
                show: true,
                max: 150,
              }}
            />
          </Form.Item>
        )}

        {mode === "url" && (
          <Form.Item
            name="url"
            validateTrigger={['onChange', 'onBlur']}
            rules={[{ required: false, message: 'Please enter a valid url', type: "url" }]}
            hasFeedback
            help="website, sitemap, youtube url."
          >
            <Input placeholder="Url" />
          </Form.Item>
        )}

        {mode === "file" && (
          <Form.Item
            name="files"
            validateTrigger="onChange"
            rules={[{ required: true }]}
            hasFeedback
          >
            <Upload.Dragger {...draggerProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                banned files.
              </p>
            </Upload.Dragger>
          </Form.Item>
        )}

        <Flex gap="small" align="center" style={{ marginBottom: 18 }}>
          <Form.Item name="with_cta" style={{ margin: 0 }}>
            <Switch size="small" />
          </Form.Item>
          <span>Is it a sitemap?</span>
        </Flex>

        <Flex gap="small" align="center" style={{ marginBottom: 18 }}>
          <Form.Item name="with_cta" style={{ margin: 0 }}>
            <Button>Fetch sitemap</Button>
          </Form.Item>
        </Flex>

        {withCta && (
          <Form.Item name="cta" label="CTA" rules={[{ required: true, type: "string", max: 150 }]} hasFeedback>
            <Input placeholder="CTA" count={{ show: true, max: 150 }} />
          </Form.Item>
        )}

      </Form>
    </Flex>
  )
}

export default NewKnowledgeForm