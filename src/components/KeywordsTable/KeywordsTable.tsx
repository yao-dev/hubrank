'use client';;
import { App, Button, Col, Empty, Flex, Input, Row, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import useProjects from '@/hooks/useProjects';
import useProjectId from '@/hooks/useProjectId';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRelatedKeywords } from '@/helpers/seo';
import useLanguages from '@/hooks/useLanguages';
import {
  SearchOutlined,
  StarOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import supabase from '@/helpers/supabase';
import { getUserId } from '@/helpers/user';

const competitionOrder: any = {
  "low": 0,
  "medium": 1,
  "high": 2,
}

type Props = {
  editMode?: boolean;
  setSelectedKeyword: (k: string) => void;
  setArticleDrawerOpen: (value: boolean) => void;
}

// getRelatedKeywords({ keyword: data.seed_keyword, depth: 4, limit: 1000 })

const KeywordsTable = ({ editMode, setSelectedKeyword, setArticleDrawerOpen }: Props) => {
  const projectId = useProjectId();
  const { data: project, isLoading, isFetched } = useProjects().getOne(projectId);
  const { data: language } = useLanguages().getOne(project?.language_id);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const { data: keywords, refetch, isFetching } = useQuery({
    enabled: false,
    queryKey: ["keywords", search],
    keepPreviousData: true,
    queryFn: () => getRelatedKeywords({ keyword: search, depth: 4, limit: 1000, lang: language?.code, location_code: language?.location_code }),
    select: (data) => {
      // data.tasks[0].result[0].items[0].keyword_data.keyword
      // data.tasks[0].result[0].items_count
      return data?.map((item: any) => {
        return {
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
    enabled: !!editMode,
    queryKey: ["saved_keywords", { projectId }],
    keepPreviousData: true,
    queryFn: () => {
      return supabase.from("saved_keywords").select("*").eq("project_id", projectId)
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
        title: 'Keyword',
        dataIndex: 'keyword',
        key: 'keyword',
        width: 500,
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
        render: (_, record: any) => (
          <Space size="small" align='center'>
            <Button
              onClick={() => {
                setSelectedKeyword(record.keyword);
                setArticleDrawerOpen(true)
              }}
            >
              use keyword
            </Button>
            {editMode ? (
              <Button icon={<DeleteOutlined twoToneColor="#ff4d4f" />} onClick={() => toggleSaveKeyword.mutate(record)} />
            ) : (
              <Button icon={<StarOutlined twoToneColor={savedKeywordsString?.includes(record.keyword) ? "#ffec3d" : undefined} />} onClick={() => toggleSaveKeyword.mutate(record)} />
            )}
          </Space>
        ),
      },
    ]
  }, []);

  const renderSearchBar = () => {
    return (
      <Flex gap="middle">
        <Input placeholder='Search keywords' value={search} onChange={e => setSearch(e.target.value)} allowClear />
        <Button icon={<SearchOutlined />} type="primary" loading={isFetching} onClick={() => refetch()}>Search</Button>
      </Flex>
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
      <Table size="small" dataSource={!editMode ? keywords : savedKeywords} columns={columns} loading={isFetching} />
    </Flex>
  )
}

export default KeywordsTable