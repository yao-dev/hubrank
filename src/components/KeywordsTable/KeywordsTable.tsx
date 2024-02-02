'use client';;
import { App, Button, Col, ConfigProvider, Empty, Flex, Form, Image, Input, Row, Select, Space, Table, Tag } from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import useProjectId from '@/hooks/useProjectId';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRelatedKeywords } from '@/helpers/seo';
import useLanguages from '@/hooks/useLanguages';
import { SearchOutlined, DeleteTwoTone } from '@ant-design/icons';
import supabase from '@/helpers/supabase';
import { getUserId } from '@/helpers/user';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

const competitionOrder: any = {
  "low": 0,
  "medium": 1,
  "high": 2,
}

type Props = {
  editMode?: boolean;
}

const KeywordsTable = ({ editMode }: Props) => {
  const projectId = useProjectId();
  const { data: project, isLoading, isFetched } = useProjects().getOne(projectId);
  const { getAll } = useLanguages();
  const { data: languages } = getAll();
  const [search, setSearch] = useState("");
  const [activeLanguage, setActiveLanguage] = useState();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const { theme } = useContext(ConfigProvider.ConfigContext);
  const router = useRouter();

  const [form] = Form.useForm();

  const { data: keywords, refetch, isFetching } = useQuery({
    enabled: false,
    queryKey: ["keywords", search],
    keepPreviousData: true,
    cacheTime: 1000 * 60 * 60 * 24 * 30, // 30 days
    queryFn: () => {
      const selectedLanguage = languages?.find(l => l.id === form.getFieldValue("language_id"))
      return getRelatedKeywords({ keyword: form.getFieldValue("search"), depth: 4, limit: 1000, lang: selectedLanguage.code, location_code: selectedLanguage.location_code })
    },
    onSuccess() {
      const selectedLanguage = languages?.find(l => l.id === form.getFieldValue("language_id"))
      setActiveLanguage(selectedLanguage)
    },
    select: (data) => {
      // data.tasks[0].result[0].items[0].keyword_data.keyword
      // data.tasks[0].result[0].items_count
      return data?.map((item: any) => {
        return {
          language_id: form.getFieldValue("language_id"),
          keyword: item.keyword_data.keyword,
          search_volume: item.keyword_data.keyword_info.search_volume,
          competition_level: item.keyword_data.keyword_info.competition_level || "",
          keyword_difficulty: item.keyword_data.keyword_properties.keyword_difficulty,
          search_intent: item.keyword_data.search_intent_info.main_intent || "",
          word_count: item.keyword_data.keyword.split(" ").length
        }
      })
    }
  });

  const { data: savedKeywords } = useQuery({
    // enabled: !!editMode,
    queryKey: ["saved_keywords", { projectId }],
    keepPreviousData: true,
    queryFn: () => {
      return supabase.from("saved_keywords").select("*, languages!language_id(*)").eq("project_id", projectId).order("id", { ascending: false })
    },
    select: ({ data }: any) => {
      return data || [];
    }
  });

  const savedKeywordsString = useMemo(() => savedKeywords?.map(i => i.keyword), [savedKeywords]);

  const toggleSaveKeyword = useMutation({
    mutationFn: async (keywordData: any) => {
      const { data: isSaved } = await supabase.from("saved_keywords").select("id").match({ keyword: keywordData.keyword, project_id: projectId }).limit(1).single()
      if (!!isSaved) {
        return supabase.from("saved_keywords").delete().eq("id", isSaved.id).throwOnError()
      }
      return supabase.from("saved_keywords").insert({
        ...keywordData,
        user_id: await getUserId(),
        project_id: projectId
      }).throwOnError()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["saved_keywords", { projectId }],
      })
    },
    onError: () => {
      notification.error({ message: "We couldn't save your change" })
    }
  })

  useEffect(() => {
    if (project?.language_id) {
      form.setFieldValue("language_id", project.language_id)
    }
  }, [project])

  // const keywords = useMemo(() => {
  //   if (!project || !project?.keywords?.length) return [];

  //   return project.keywords.map((item: any) => {
  //     return {
  //       keyword: item.keyword_data.keyword,
  //       search_volume: item.keyword_data.keyword_info.search_volume,
  //       competition_level: item.keyword_data.keyword_info.competition_level || "",
  //       keyword_difficulty: item.keyword_data.keyword_properties.keyword_difficulty,
  //       search_intent: item.keyword_data.search_intent_info.main_intent || "",
  //       word_count: item.keyword_data.keyword.split(" ").length
  //     }
  //   })
  // }, [project]);

  const columns = useMemo(() => {
    return [
      {
        dataIndex: 'language',
        key: 'language',
        width: 50,
        render: (_value: any, record: any) => {
          if (editMode && !record?.languages?.image || !editMode && !activeLanguage?.image) {
            return (
              <span>-</span>
            )
          }
          return (
            <Image src={editMode ? record.languages.image : activeLanguage.image} width={25} height={25} preview={false} />
          )
        },
      },
      {
        title: 'Keyword',
        dataIndex: 'keyword',
        key: 'keyword',
        width: 520,
      },
      {
        title: 'Search volume',
        dataIndex: 'search_volume',
        key: 'search_volume',
        sorter: (a: any, b: any) => a.search_volume - b.search_volume,
        render: (value: any) => {
          return (
            <span>
              {value || "-"}
            </span>
          )
        },
      },
      {
        title: 'Competition',
        dataIndex: 'competition_level',
        key: 'competition_level',
        filters: [
          { text: 'Low', value: 'low' },
          { text: 'Medium', value: 'medium' },
          { text: 'High', value: 'high' },
        ],
        onFilter: (value: string, record: any) => record.competition_level.toLowerCase().includes(value),
        sorter: (a: any, b: any) => {
          return competitionOrder[a.competition_level.toLowerCase()] - competitionOrder[b.competition_level.toLowerCase()]
        },
        render: (tag: any) => {
          if (!tag) {
            return (
              <span>-</span>
            )
          }

          let color;
          const tagLowercase = tag.toLowerCase()

          if (tagLowercase === "low") color = "green";
          if (tagLowercase === "medium") color = "geekblue";
          if (tagLowercase === "high") color = "volcano";

          return (
            <span>
              <Tag color={color}>
                {tag.toUpperCase()}
              </Tag>
            </span>
          )
        },
      },
      {
        title: 'Keyword difficulty',
        dataIndex: 'keyword_difficulty',
        key: 'keyword_difficulty',
        filters: [
          { text: '0-25', value: 0 },
          { text: '25-50', value: 25 },
          { text: '50-75', value: 50 },
          { text: '+75', value: 75 },
        ],
        onFilter: (value: string, record: any) => record.keyword_difficulty >= value && record.keyword_difficulty <= value + 25,
        sorter: (a: any, b: any) => a.keyword_difficulty - b.keyword_difficulty,
        render: (value: any) => {
          return (
            <span>
              {value || "-"}
            </span>
          )
        },
      },
      {
        title: 'Search intent',
        dataIndex: 'search_intent',
        key: 'search_intent',
        filters: [
          { text: 'Navigational', value: 'navigational' },
          { text: 'Informational', value: 'informational' },
          { text: 'Commercial', value: 'commercial' },
        ],
        onFilter: (value: string, record) => record.search_intent.toLowerCase().includes(value),
        render: (value: any) => {
          return (
            <span>
              {value || "-"}
            </span>
          )
        },
      },
      {
        title: 'Word count',
        dataIndex: 'word_count',
        key: 'word_count',
        filters: [
          { text: '>= 3', value: 3 },
          { text: '>= 4', value: 4 },
          { text: '>= 5', value: 5 },
        ],
        onFilter: (value: string, record: any) => record.word_count >= value,
        sorter: (a: any, b: any) => a.word_count - b.word_count,
      },
      {
        title: 'Action',
        dataIndex: 'action',
        key: 'action',
        render: (_: any, record: any) => {
          const StarComponent = savedKeywordsString?.includes(record.keyword) ? IconStarFilled : IconStar;
          return (
            <Space size="small" align='center'>
              <Button
                onClick={() => {
                  router.push(`/projects/${projectId}/articles/new?k=${record.keyword}&lid=${record.language_id || ""}`)
                }}
              >
                use keyword
              </Button>
              {editMode ? (
                <Button icon={<DeleteTwoTone twoToneColor="#ff4d4f" />} onClick={() => toggleSaveKeyword.mutate(record)} />
              ) : (
                <Button
                  icon={(
                    <StarComponent
                      size={16}
                      style={{ color: savedKeywordsString?.includes(record.keyword) ? "#fadb14" : undefined }}
                    />
                  )}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => toggleSaveKeyword.mutate(record)}
                />
              )}
            </Space>
          )
        },
      },
    ]
  }, [editMode, activeLanguage, savedKeywords, savedKeywordsString, theme]);

  const renderSearchBar = () => {
    return (
      <Form
        form={form}
        initialValues={{
          search: "",
          language_id: null
        }}
        onFinish={(values) => {
          refetch()
        }}
      >
        <Flex gap="middle">
          <Form.Item noStyle name="search" required>
            <Input placeholder='Search keywords' value={search} onChange={e => setSearch(e.target.value)} allowClear />
          </Form.Item>
          <Form.Item noStyle name="language_id" required>
            <Select
              placeholder="Country"
              optionLabelProp="label"
              options={languages?.map((p) => {
                return {
                  ...p,
                  label: p.label,
                  value: p.id
                }
              })}
              optionRender={(option: any) => {
                return (
                  <Space>
                    <Image
                      src={option.data.image}
                      width={25}
                      height={25}
                      preview={false}
                    />
                    {/* {option.label} */}
                  </Space>
                )
              }}
            />
          </Form.Item>
          <Button disabled={!form.getFieldValue("search") || !form.getFieldValue("language_id")} icon={<SearchOutlined />} type="primary" htmlType="submit" loading={isFetching}>Search</Button>
        </Flex>
      </Form>
    )
  }

  if (
    !editMode && !isLoading && isFetched && !keywords?.length ||
    editMode && !isLoading && isFetched && !savedKeywords?.length
  ) {
    return (
      <Flex vertical gap="large">
        <Flex align='center' justify='center' style={{ marginTop: 96 }}>
          <Empty
            image="/image-1.png"
            imageStyle={{ height: 200 }}
            description="No keywords"
          />
        </Flex>
        {!editMode && (
          <Flex vertical align='center' justify='center' >
            {renderSearchBar()}
          </Flex>
        )}
      </Flex>
    )
  }

  return (
    <Flex vertical gap="large">
      {!editMode && (
        <Row>
          <Col span={9}>
            {renderSearchBar()}
          </Col>
        </Row>
      )}
      <Table
        size="small"
        dataSource={!editMode ? keywords : savedKeywords}
        columns={columns}
        loading={isFetching}
        pagination={{
          pageSize: 25
        }}
      />
    </Flex>
  )
}

export default KeywordsTable