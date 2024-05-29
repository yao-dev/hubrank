'use client';;
import {
  App,
  AutoComplete,
  Button,
  Col,
  ConfigProvider,
  Empty,
  Flex,
  Form,
  Grid,
  Image,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import useProjectId from '@/hooks/useProjectId';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRelatedKeywords } from '@/helpers/seo';
import useLanguages from '@/hooks/useLanguages';
import { DeleteTwoTone, SearchOutlined } from '@ant-design/icons';
import supabase from '@/helpers/supabase';
import { getUserId } from '@/helpers/user';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { isEmpty } from 'lodash';

const competitionOrder: any = {
  "low": 0,
  "medium": 1,
  "high": 2,
}

type Props = {
  savedMode?: boolean;
}

const KeywordsTable = ({ savedMode }: Props) => {
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId);
  const { getAll } = useLanguages();
  const { data: languages } = getAll();
  const [activeLanguage, setActiveLanguage] = useState();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const { theme } = useContext(ConfigProvider.ConfigContext);
  const router = useRouter();
  const [form] = Form.useForm();
  const search = Form.useWatch('search', form);
  const language_id = Form.useWatch('language_id', form);
  const selectedLanguage = languages?.find(l => l.id === language_id);
  const [keywords, setKeywords] = useState([]);
  const [isFetchingKeywords, setIsFetchingKeywords] = useState(false);
  const screens = Grid.useBreakpoint();

  // const { data: keywords, isLoading: isSearchModeFetching, isFetching, isFetched: isfetched1 } = useQuery({
  //   enabled: searchEnabled,
  //   queryKey: ["keywords", search, language_id],
  //   placeholderData: keepPreviousData,
  //   gcTime: Infinity,
  //   queryFn: () => {
  //     return getRelatedKeywords({ keyword: search, depth: 4, limit: 1000, lang: selectedLanguage.code, location_code: selectedLanguage.location_code })
  //   },
  //   select: (data) => {
  //     return data?.map((item: any) => {
  //       return {
  //         language_id: language_id,
  //         keyword: item.keyword_data.keyword,
  //         search_volume: item.keyword_data.keyword_info.search_volume,
  //         competition_level: item.keyword_data.keyword_info.competition_level || "",
  //         keyword_difficulty: item.keyword_data.keyword_properties.keyword_difficulty,
  //         search_intent: item.keyword_data.search_intent_info.main_intent || "",
  //         word_count: item.keyword_data.keyword.split(" ").length
  //       }
  //     })
  //   },
  // });

  const { data: searchedKeywords } = useQuery({
    enabled: !!projectId,
    queryKey: ["searched_keywords", { projectId }],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      return supabase.from("searched_keywords").select("*").match({
        project_id: projectId,
        user_id: await getUserId()
      })
    },
    select: ({ data }) => {
      return data?.map((item: any) => ({
        value: item.keyword,
        label: item.keyword,
      }))
    },
  });

  const { data: savedKeywords, isLoading: isSavedModeFetching } = useQuery({
    queryKey: ["saved_keywords", { projectId }],
    placeholderData: keepPreviousData,
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
  }, [project]);

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
          if (savedMode && !record?.languages?.image || !savedMode && !activeLanguage?.image) {
            return (
              <span>-</span>
            )
          }
          return (
            <Image src={savedMode ? record.languages.image : activeLanguage?.image} width={25} height={25} preview={false} />
          )
        },
      },
      {
        title: 'Keyword',
        dataIndex: 'keyword',
        key: 'keyword',
        // width: 425,
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
        onFilter: (value: string, record: any) => record.search_intent.toLowerCase().includes(value),
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
        // title: 'Action',
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
              {savedMode ? (
                <Button icon={<DeleteTwoTone twoToneColor="#ff4d4f" />} onClick={() => toggleSaveKeyword.mutate(record)} />
              ) : (
                <Button
                  icon={(
                    <StarComponent
                      size={16}
                      style={{ color: savedKeywordsString?.includes(record.keyword) ? "#5D5FEF" : undefined }}
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

  }, [savedMode, activeLanguage, savedKeywords, savedKeywordsString, theme]);

  const renderSearchBar = () => {
    return (
      <Form
        form={form}
        initialValues={{
          search: "",
          language_id: selectedLanguage?.id || project?.language_id
        }}
        onFinish={async (values) => {
          try {
            setIsFetchingKeywords(true);
            const searchTerm = values.search;

            const language = languages?.find(l => l.id === values.language_id)
            const keywordSearchKey = ["keywords", { search: searchTerm, languageId: values.language_id }];
            const state = queryClient.getQueryState(keywordSearchKey);

            const { data: isKeywordSearchBefore } = await supabase.from("searched_keywords").select("id").match({
              keyword: searchTerm,
              project_id: projectId
            }).limit(1).single();

            if (!isKeywordSearchBefore) {
              await supabase.from("searched_keywords").insert({
                keyword: searchTerm,
                user_id: await getUserId(),
                project_id: projectId
              })
            }

            if (isEmpty(state?.data)) {
              queryClient.invalidateQueries({
                queryKey: ["searched_keywords", { projectId }]
              });
              let newKeywords = await getRelatedKeywords({ keyword: searchTerm, depth: 4, limit: 1000, lang: language.code, location_code: language.location_code })
              newKeywords = newKeywords?.map((item: any) => {
                return {
                  language_id: values.language_id,
                  keyword: item.keyword_data.keyword,
                  search_volume: item.keyword_data.keyword_info.search_volume,
                  competition_level: item.keyword_data.keyword_info.competition_level || "",
                  keyword_difficulty: item.keyword_data.keyword_properties.keyword_difficulty,
                  search_intent: item.keyword_data.search_intent_info.main_intent || "",
                  word_count: item.keyword_data.keyword.split(" ").length
                }
              })
              queryClient.setQueryData(keywordSearchKey, newKeywords);
              setKeywords(newKeywords)
            } else {
              setKeywords(state?.data || [])
            }
            setActiveLanguage(language)
          } finally {
            setIsFetchingKeywords(false)
          }
        }}
      >
        {/* <Form.Item noStyle name="search" required>
                <AutoComplete
                  options={searchedKeywords}
                  style={{ width: "100%", marginBottom: 8 }}
                  // onSelect={onSelect}
                  // onSearch={(text) => setOptions(getPanelValue(text))}
                  placeholder="Search keywords"
                  allowClear
                />
              </Form.Item> */}

        <Flex gap="small">
          <Form.Item noStyle name="language_id">
            <Select
              placeholder="Country"
              optionLabelProp="label"
              style={{ width: 150 }}
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
                    {option.label}
                  </Space>
                )
              }}
            />
          </Form.Item>
          <Form.Item noStyle name="search">
            <AutoComplete
              options={searchedKeywords}
              // onSelect={onSelect}
              // onSearch={(text) => setOptions(getPanelValue(text))}
              placeholder="Search keywords"
              allowClear
              style={{ width: 250 }}
            />
          </Form.Item>
          <Button
            disabled={!search || !language_id}
            icon={screens.xs ? <SearchOutlined /> : null}
            type="primary"
            htmlType="submit"
            loading={isFetchingKeywords}
            style={{ width: "auto", marginBottom: 8 }}
          >
            {screens.xs ? "(1 credit)" : "Search (1 credit)"}
          </Button>
        </Flex>
      </Form>
    )
  }

  if (
    !savedMode && !isSavedModeFetching && !keywords?.length
    // savedMode && !isSearchModeFetching && !savedKeywords?.length
  ) {
    return (
      <Flex vertical gap="large">
        <Flex align='center' justify='center' style={{ marginTop: 96 }}>
          <Empty
            image="/image-1.png"
            imageStyle={{ height: screens.xs ? 125 : 200 }}
            description="No keywords"
          />
        </Flex>
        {!savedMode && (
          <Flex vertical align='center' justify='center' >
            {renderSearchBar()}
          </Flex>
        )}
      </Flex>
    )
  }

  return (
    <Flex vertical gap="large" style={{ overflow: "auto" }}>
      {!savedMode && (
        <Row>
          <Col span={12}>
            {renderSearchBar()}
          </Col>
        </Row>
      )}
      <Table
        size="small"
        dataSource={!savedMode ? keywords : savedKeywords}
        columns={columns}
        loading={isFetchingKeywords}
        pagination={{
          pageSize: 25
        }}
        style={{ minWidth: 900, overflow: "auto" }}
      />
    </Flex>
  )
}

export default KeywordsTable