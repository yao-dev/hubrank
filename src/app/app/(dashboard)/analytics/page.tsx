'use client';;
import useProjectId from "@/hooks/useProjectId";
import useProjects from "@/hooks/useProjects";
import { Button, Flex, Input, InputRef, message, Space, Spin, Table, TableColumnType } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import { SearchOutlined } from '@ant-design/icons';
import axios from "axios";
import Highlighter from 'react-highlight-words';
import type { FilterDropdownProps } from 'antd/es/table/interface';

import PageTitle from "@/components/PageTitle/PageTitle";
import Label from "@/components/Label/Label";
import { useQuery } from "@tanstack/react-query";
import queryKeys from "@/helpers/queryKeys";
import GoogleSearchConsoleSignInButton from "@/components/GoogleSearchConsoleSignInButton/GoogleSearchConsoleSignInButton";
import { useRouter, useSearchParams } from "next/navigation";
import useGoogleSearchConsole from "@/hooks/useGoogleSearchConsole";
import useSession from "@/hooks/useSession";
import supabase from '@/helpers/supabase/client';

export default function Analytics() {
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId)
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);
  const [selectedUrls, setSelectedUrls] = useState([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const googleSearchConsole = useGoogleSearchConsole();
  const sessionStore = useSession()
  const [isFetchingScopes, setIsFetchingScopes] = useState(false)

  useEffect(() => {
    setIsFetchingScopes(true);
    axios.post('/api/token-info', {
      access_token: sessionStore.session.access_token
    })
      .then(({ data: tokenInfo }) => {
        console.log(tokenInfo)
      })
      .finally(() => {
        setIsFetchingScopes(false)
      })
  }, [])

  useEffect(() => {
    if (!isFetchingScopes) {
      const error = searchParams.get("error") ?? "";
      const accessToken = searchParams.get("access_token") ?? "";
      if (error) {
        message.error("You need to give access to the permissions requested");
        router.replace("/analytics");
      } else if (accessToken) {
        supabase.auth.refreshSession({ refresh_token: accessToken }).then(console.log);
        console.log(accessToken)
        googleSearchConsole.setAccessToken(accessToken)
        router.replace("/analytics");
      }
    }
  }, [isFetchingScopes, searchParams]);

  const { data: sitemapUrls = [], isPending } = useQuery({
    // enabled: !!project.sitemap,
    enabled: false,
    queryKey: queryKeys.sitemap(project?.sitemap),
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

  if (isFetchingScopes) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin spinning />
      </div>
    )
  }

  return (
    <div
      className="relative flex flex-col h-full"
    >
      <div className="flex flex-row items-center justify-between">
        <PageTitle title="Analytics" />
        <Button
          type="primary"
          disabled={!selectedUrls.length}
          className="w-[125px]"
        >
          Index {selectedUrls.length ?? 0} {selectedUrls.length > 1 ? "urls" : "url"}
        </Button>
      </div>

      <GoogleSearchConsoleSignInButton />

      <Flex hidden vertical gap={12}>
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