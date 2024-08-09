'use client';;
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import { Button, Flex, Input, InputRef, Space, Table, TableColumnType } from "antd";
import { useMemo, useRef, useState } from "react";
import { SearchOutlined } from '@ant-design/icons';
import axios from "axios";
import Highlighter from 'react-highlight-words';
import type { FilterDropdownProps } from 'antd/es/table/interface';

import PageTitle from "@/components/PageTitle/PageTitle";
import Label from "@/components/Label/Label";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "@/helpers/queryKeys";

export default function IndexUrls({
  params,
}: {
  params: { project_id: number }
}) {
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId)
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const [selectedUrls, setSelectedUrls] = useState([]);

  const { data: sitemapUrls = [], isPending } = useQuery({
    enabled: !!project.sitemap,
    queryKey: queryKeys.sitemap(project.sitemap),
    queryFn: async () => {
      const { data } = await axios.post("/api/sitemap", {
        website_url: project?.website,
        url: project?.sitemap,
      });
      return data?.urls ?? [];
    },
  });

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: any,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = () => {
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex: any): TableColumnType<DataType> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
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
            // onClick={() => handleSearch([], confirm, dataIndex)}
            onClick={() => handleReset()}
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
    onChange: (rowKeys: React.Key[], selectedRows: DataType[]) => {
      setSelectedUrls(selectedRows.map(item => item.url))
    },
    getCheckboxProps: (record: DataType) => ({
      disabled: false,
      url: record.url,
    }),
    selectedRowKeys: selectedUrls,
  };

  return (
    <div
      className="relative flex flex-col h-full"
    >
      <div className="flex flex-row items-center justify-between">
        <PageTitle title="Index urls" />
        <Button
          type="primary"
          disabled={!selectedUrls.length}
          className="w-[125px]"
        >
          Index {selectedUrls.length ?? 0} {selectedUrls.length > 1 ? "urls" : "url"}
        </Button>
      </div>

      <Flex vertical gap={12}>
        <Label name="Select urls you want to index" />
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          columns={columns}
          dataSource={sitemapUrls.map((url: string) => ({ key: url, url }))}
          pagination={false}
          scroll={{ y: 400 }}
          size="small"
          loading={isPending}
          rowKey="url"
          rowClassName="cursor-pointer"
          onRow={(record) => {
            return {
              onClick: () => {
                const urls = new Set(selectedUrls);
                if (urls.has(record.url)) {
                  urls.delete(record.url)
                } else {
                  urls.add(record.url);
                }
                setSelectedUrls([...urls]);
              },
            };
          }}
        />
      </Flex>
    </div>
  )
}