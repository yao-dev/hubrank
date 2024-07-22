'use client';;
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import {
  Button,
  Flex,
  Form,
  FormInstance,
  Input,
  InputRef,
  Radio,
  RadioChangeEvent,
  Space,
  Switch,
  Table,
  Upload,
  UploadProps,
  message,
} from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import useDrawers from "@/hooks/useDrawers";
import WritingStyleForm from "../WritingStyleForm/WritingStyleForm";
import Label from "../Label/Label";
import { InboxOutlined, SearchOutlined } from '@ant-design/icons';
import axios from "axios";
import { isEmpty } from "lodash";
import Highlighter from 'react-highlight-words';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import { getUserId } from "@/helpers/user";

type DataType = {
  key: React.Key;
  url: string;
}

type DataIndex = keyof DataType;

type Props = {
  onSubmit: (values: any) => void;
  form: FormInstance<any>
}

const NewKnowledgeForm = ({ onSubmit, form }: Props) => {
  const projectId = useProjectId();
  const { data: project, isPending } = useProjects().getOne(projectId)
  const [, contextHolder] = message.useMessage();
  const [isWritingStyleModalOpened, setIsWritingStyleModalOpened] = useState(false);
  const [isFetchingSitemap, setIsFetchingSitemap] = useState(false);
  const [sitemapUrls, setSitemapUrls] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [draggerProps, setDraggerProps] = useState<UploadProps>();
  const searchInput = useRef<InputRef>(null);
  const drawers = useDrawers();
  const mode = Form.useWatch('mode', form);
  const isSitemap = Form.useWatch('is_sitemap', form);

  useEffect(() => {
    if (project && drawers.caption.isOpen) {
      form.setFieldValue("language_id", drawers.caption.languageId || project.language_id)
    }
  }, [project, drawers.caption.isOpen]);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Clear
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text: any) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = useMemo(() => {
    return [
      {
        title: "Url",
        dataIndex: 'url',
        key: 'url',
        ...getColumnSearchProps('url'),
      },
    ]
  }, []);

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      form.setFieldValue("urls", selectedRows.map(item => item.url));
      console.log("test urls", selectedRows.map(item => item.url));
      console.log("form urls", form.getFieldValue("urls"))
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: false,
      url: record.url,
    }),
  };

  const onFetchSiteMapUrls = async () => {
    setIsFetchingSitemap(true)
    try {
      const { data } = await axios.post("/api/sitemap", {
        website_url: project.website,
        url: form.getFieldValue("url"),
      });
      if (!isEmpty(data.urls)) {
        setSitemapUrls(data.urls)
      }
      setIsFetchingSitemap(false)
    } catch (e) {
      console.error(e)
      setIsFetchingSitemap(false);
      message.error("We couldn't fetch your sitemap urls, please try again.")
    }
  }

  useEffect(() => {
    getUserId().then((userId) => {
      setDraggerProps({
        name: 'file',
        multiple: false,
        accept: "pdf,doc,csv,txt,html,json,md",
        action: '/api/upload',
        maxCount: 1,
        headers: {
          user_id: userId ?? "",
          project_id: projectId.toString()
        },
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
      })
    })
  }, [])

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
          is_sitemap: false
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onSubmit}
        onError={console.log}
        disabled={isFetchingSitemap}
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
            rules={[{ type: "string", max: 1000, required: true }]}
            hasFeedback
          >
            <Input.TextArea
              placeholder="Add any text as a knowledge resource to train the AI on"
              autoSize={{ minRows: 3, maxRows: 20 }}
              count={{
                show: true,
                max: 1000,
              }}
            />
          </Form.Item>
        )}

        {mode === "url" && (
          <>
            <Form.Item
              name="url"
              validateTrigger={['onChange', 'onBlur']}
              rules={[{ required: true, message: 'Please enter a valid url', type: "url" }]}
              hasFeedback
              help="Website, sitemap, youtube url."
            >
              <Input placeholder="Url" />
            </Form.Item>
            <Flex gap="small" align="center" style={{ marginBottom: 18 }}>
              <Form.Item name="is_sitemap" style={{ margin: 0 }}>
                <Switch size="small" />
              </Form.Item>
              <span className="cursor-pointer" onClick={() => form.setFieldValue("is_sitemap", !form.getFieldValue("is_sitemap"))}>Is it a sitemap?</span>
            </Flex>
          </>
        )}

        {mode === "url" && isSitemap && (
          <Flex gap="small" align="center" style={{ marginBottom: 18 }}>
            <Form.Item style={{ margin: 0 }}>
              <Button loading={isFetchingSitemap} onClick={onFetchSiteMapUrls}>Fetch sitemap urls</Button>
            </Form.Item>
          </Flex>
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
                You can upload up to 10 files at once, we only support the following files (<b>pdf,doc,csv,txt,html,json,md</b>) with up to <b>5MB</b> per file.
              </p>
            </Upload.Dragger>
          </Form.Item>
        )}
      </Form>

      {mode === "url" && isSitemap && !isEmpty(sitemapUrls) && (
        <Flex vertical gap={12}>
          <Label name="Select urls you want the AI to be trained on" />
          <Table
            rowSelection={{
              type: "checkbox",
              ...rowSelection,
            }}
            columns={columns}
            dataSource={sitemapUrls.map((url) => ({ key: url, url }))}
            pagination={false}
            scroll={{ y: 400 }}
            size="small"
          />
          <p><b>{sitemapUrls.length}</b> urls found</p>
        </Flex>
      )}
    </Flex>
  )
}

export default NewKnowledgeForm