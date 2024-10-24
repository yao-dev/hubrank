'use client';;
import {
  App,
  AutoComplete,
  Button,
  ConfigProvider,
  Empty,
  Flex,
  Form,
  Grid,
  Image,
  Space,
  Table,
  Tabs,
  TabsProps,
  Tag,
} from 'antd';
import { useContext, useEffect, useMemo, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import useProjectId from '@/hooks/useProjectId';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useLanguages from '@/hooks/useLanguages';
import { DeleteTwoTone, SearchOutlined } from '@ant-design/icons';
import supabase from '@/helpers/supabase/client';
import { getUserId } from '@/helpers/user';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { isEmpty } from 'lodash';
import useDrawers from '@/hooks/useDrawers';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import axios from 'axios';
import usePricingModal from '@/hooks/usePricingModal';
import useUser from '@/hooks/useUser';
import queryKeys from '@/helpers/queryKeys';
import TopicalMapTable from '../TopicalMapTable/TopicalMapTable';

const competitionOrder: any = {
  "low": 0,
  "medium": 1,
  "high": 2,
}

const KeywordsTable = () => {
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId);
  const { getAll } = useLanguages();
  const { data: languages } = getAll();
  const [activeLanguage, setActiveLanguage] = useState();
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const { theme } = useContext(ConfigProvider.ConfigContext);
  const router = useRouter();
  const [keywordIdeasForm] = Form.useForm();
  const [topicalMapForm] = Form.useForm();
  const search = Form.useWatch('search', keywordIdeasForm);
  const language_id = Form.useWatch('language_id', keywordIdeasForm);
  const selectedLanguage = languages?.find(l => l.id === language_id);
  const [keywords, setKeywords] = useState([]);
  const [isFetchingKeywords, setIsFetchingKeywords] = useState(false);
  const [showSavedKeywords, setShowSavedKeywords] = useState(false);
  const screens = Grid.useBreakpoint();
  const drawers = useDrawers();
  const pricingModal = usePricingModal();
  const user = useUser()

  const { data: searchedKeywords, isFetched: isSearchedKeywordsFetched } = useQuery({
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

  const { data: savedKeywords, isFetched: isSavedKeywordsFetched } = useQuery({
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
      keywordIdeasForm.setFieldValue("language_id", project.language_id)
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
          const StarComponent = savedKeywordsString?.includes(record.keyword) ? IconStarFilled : IconStar;
          const favoriteIcon = !showSavedKeywords && (
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
          )

          if (showSavedKeywords && !record?.languages?.image || !showSavedKeywords && !activeLanguage?.image) {
            return (
              <div className='flex flex-row items-center gap-2'>
                {favoriteIcon}
                <span>-</span>
              </div>
            )
          }
          return (
            <div className='flex flex-row items-center gap-2'>
              {favoriteIcon}
              <Image src={showSavedKeywords ? record.languages.image : activeLanguage?.image} width={25} height={25} preview={false} />
            </div>
          )
        },
      },
      {
        title: 'Keyword',
        dataIndex: 'keyword',
        key: 'keyword',
        width: 400,
      },
      {
        title: 'Volume',
        dataIndex: 'search_volume',
        key: 'search_volume',
        align: "center",
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
        align: "center",
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
        title: 'KD',
        dataIndex: 'keyword_difficulty',
        key: 'keyword_difficulty',
        width: 50,
        align: "center",
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
        align: "center",
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
        align: "center",
        filters: [
          { text: '>= 3', value: 3 },
          { text: '>= 4', value: 4 },
          { text: '>= 5', value: 5 },
        ],
        onFilter: (value: string, record: any) => record.word_count >= value,
        sorter: (a: any, b: any) => a.word_count - b.word_count,
      },
      {
        dataIndex: 'action',
        key: 'action',
        align: "center",
        render: (_: any, record: any) => {
          return (
            <Space size="small" align='center'>
              <Button
                type="primary"
                onClick={() => {
                  drawers.openBlogPostDrawer({
                    isOpen: true,
                    languageId: record.language_id || "",
                    seedKeyword: record.keyword
                  })
                }}
              >
                Write
              </Button>
              {showSavedKeywords && <Button icon={<DeleteTwoTone twoToneColor="#ff4d4f" />} onClick={() => toggleSaveKeyword.mutate(record)} />}
            </Space>
          )
        },
      },
    ]

  }, [showSavedKeywords, activeLanguage, savedKeywords, savedKeywordsString, theme]);

  const renderSearchBar = () => {
    return (
      <Form
        form={keywordIdeasForm}
        initialValues={{
          search: "",
          language_id: selectedLanguage?.id || project?.language_id
        }}
        disabled={isFetchingKeywords}
        onFinish={async (values) => {
          try {
            if (!user.premium.keywords_research) {
              return pricingModal.open(true)
            }
            setIsFetchingKeywords(true);
            setShowSavedKeywords(false);
            const searchTerm = values.search;

            const language = languages?.find(l => l.id === values.language_id)
            const keywordSearchKey = ["keywords", { search: searchTerm, languageId: values.language_id }];
            const state = queryClient.getQueryState(keywordSearchKey);

            const { data: isKeywordSearchBefore } = await supabase.from("searched_keywords").select("id").match({
              keyword: searchTerm,
              project_id: projectId
            }).limit(1).single();

            const userId = await getUserId();

            if (!isKeywordSearchBefore) {
              await supabase.from("searched_keywords").insert({
                keyword: searchTerm,
                user_id: userId,
                project_id: projectId
              })
            }

            if (isEmpty(state?.data)) {
              queryClient.invalidateQueries({
                queryKey: ["searched_keywords", { projectId }]
              });
              let { data: keywordsSuggestion } = await axios.post('/api/keywords-suggestion', {
                userId,
                query: searchTerm,
                lang: language.code,
                locationCode: language.location_code,
              });

              const newKeywords = keywordsSuggestion?.map((item: any) => {
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
            queryClient.invalidateQueries({
              queryKey: queryKeys.user()
            });
            setActiveLanguage(language)
          } catch (e) {
            if (e?.response?.status === 401) {
              return pricingModal.open(true)
            }
          } finally {
            setIsFetchingKeywords(false)
          }
        }}
      >
        <Flex gap="small">
          <Form.Item noStyle name="language_id">
            <LanguageSelect languages={languages} placeholder="Country" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item noStyle name="search">
            <AutoComplete
              options={searchedKeywords}
              // onSelect={onSelect}
              // onSearch={(text) => setOptions(getPanelValue(text))}
              placeholder="Get keyword ideas"
              allowClear
              style={{ width: 250 }}
            />
          </Form.Item>
          <Button
            disabled={!search || !language_id}
            icon={<SearchOutlined />}
            type="primary"
            htmlType="submit"
            loading={isFetchingKeywords}
            style={{ width: "auto", marginBottom: 0 }}
          >
            Search
          </Button>
        </Flex>
      </Form>
    )
  }

  const items: TabsProps['items'] = [
    {
      key: 'keyword-ideas',
      label: 'Keyword ideas',
      children: (
        <div className='flex flex-col gap-4'>
          {renderSearchBar()}
          {isSearchedKeywordsFetched && isEmpty(keywords) ? (
            <Flex align='center' justify='center' style={{ marginTop: 96 }}>
              <Empty
                image="https://usehubrank.com/empty-state/empty-keywords.png"
                imageStyle={{ height: 250 }}
                description={(
                  <span className='m-0 text-base'>
                    No keywords found
                  </span>
                )}
              />
            </Flex>
          ) : (
            <Table
              size="small"
              virtual
              dataSource={keywords}
              columns={columns}
              loading={isFetchingKeywords}
              pagination={{
                pageSize: 50,
                position: ["bottomCenter"],
                showSizeChanger: false,
                size: "default",
                responsive: true
              }}
              style={{ minWidth: 900, overflow: "auto" }}
            />
          )}
        </div>
      )
    },
    {
      key: 'topical-map',
      label: 'Topical map',
      children: <TopicalMapTable />
    },
    {
      key: 'saved-keywords',
      label: 'Saved keywords',
      children: isSavedKeywordsFetched && isEmpty(savedKeywords) ? (
        <Flex align='center' justify='center' style={{ marginTop: 96 }}>
          <Empty
            image="https://usehubrank.com/empty-state/empty-keywords.png"
            imageStyle={{ height: 250 }}
            description={(
              <span className='m-0 text-base'>
                No keywords saved
              </span>
            )}
          />
        </Flex>
      ) : (
        <Table
          size="small"
          virtual
          dataSource={savedKeywords}
          columns={columns}
          loading={isFetchingKeywords}
          pagination={{
            pageSize: 50,
            position: ["bottomCenter"],
            showSizeChanger: false,
            size: "default",
            responsive: true
          }}
          style={{ minWidth: 900, overflow: "auto" }}
        />
      )
    },
  ];

  return (
    <>
      <Tabs
        tabPosition="left"
        defaultActiveKey="blog-posts"
        // activeKey={activeTab}
        // onChange={onChange}
        items={items}
      // tabBarExtraContent={{
      //   right: getTabBarExtraContent()
      // }}
      />
    </>
  )
}

export default KeywordsTable