'use client';;
import { AutoComplete, Button, Empty, Flex, Form, Space, Spin, Table, Tag } from 'antd';
import { useEffect, useMemo } from 'react';
import useProjects from '@/hooks/useProjects';
import useProjectId from '@/hooks/useProjectId';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import useLanguages from '@/hooks/useLanguages';
import useDrawers from '@/hooks/useDrawers';
import LanguageSelect from '../LanguageSelect/LanguageSelect';
import usePricingModal from '@/hooks/usePricingModal';
import useUser from '@/hooks/useUser';
import axios from 'axios';
import { isEmpty } from 'lodash';
import { IconLink } from '@tabler/icons-react';
import queryKeys from '@/helpers/queryKeys';

const TopicalMapTable = () => {
  const projectId = useProjectId();
  const { data: project } = useProjects().getOne(projectId);
  const { getAll } = useLanguages();
  const { data: languages } = getAll();
  const [topicalMapForm] = Form.useForm();
  const search = Form.useWatch('search', topicalMapForm);
  const language_id = Form.useWatch('language_id', topicalMapForm);
  const selectedLanguage = languages?.find(l => l.id === language_id);
  const drawers = useDrawers();
  const pricingModal = usePricingModal();
  const user = useUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (project?.language_id) {
      topicalMapForm.setFieldValue("language_id", project.language_id)
    }
  }, [project]);

  const createTopicalMap = useQuery({
    enabled: false,
    queryKey: ["topical_map", { search, language_id }],
    queryFn: async () => {
      const existingData = queryClient.getQueryData(['topical_map', { search, language_id }]);

      if (existingData) return existingData;

      const language = languages?.find(l => l.id === language_id)

      const { data } = await axios.post("/api/topical-map", {
        user_id: user.id,
        primary_keyword: search,
        lang: language.code,
        locationCode: language.location_code,
      });

      return data;
    },
    placeholderData: keepPreviousData,
    throwOnError: true
  });

  const onSubmit = () => {
    if (!user.premium.keywords_research) {
      return pricingModal.open(true)
    }
    try {
      createTopicalMap.refetch()
    } catch (e) {
      if (error?.response?.status === 401) {
        return pricingModal.open(true)
      }
      return;
    }

    queryClient.setQueryData(['topical_map', { search, language_id }], data);
    queryClient.invalidateQueries({ queryKey: queryKeys.user() })
  }

  const columns = useMemo(() => {
    return [
      // {
      //   width: 50,
      //   render: (_value: any, record: any) => {
      //     const savedKeywordsString = [];
      //     // const StarComponent = savedKeywordsString?.includes(record.keyword) ? IconStarFilled : IconStar;
      //     const StarComponent = IconStar;

      //     return (
      //       <div className='flex flex-row items-center gap-2'>
      //         <Button
      //           icon={(
      //             <StarComponent
      //               size={16}
      //               style={{ color: savedKeywordsString?.includes(record.keyword) ? "#5D5FEF" : undefined }}
      //             />
      //           )}
      //           style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      //         // onClick={() => toggleSaveKeyword.mutate(record)}
      //         />
      //       </div>
      //     )
      //   },
      // },
      {
        title: 'Headline',
        dataIndex: 'headline',
        key: 'headline',
        width: 650,
        render: (_, record) => {
          return (
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col'>
                <p className='font-medium'>{record.headline}</p>
                <div className='flex flex-row gap-2 items-center'>
                  <IconLink size={18} className='text-gray-500' />
                  <p className=' text-xs text-gray-500 font-light text-ellipsis w-full'>{record.slug}</p>
                </div>
              </div>
            </div>
          )
        }
      },
      {
        title: 'Keyword',
        dataIndex: 'keyword',
        key: 'keyword',
        width: 250
      },
      {
        title: 'KD',
        dataIndex: 'kd',
        key: 'kd',
        width: 50,
        align: "center",
      },
      {
        title: 'Volume',
        dataIndex: 'volume',
        key: 'volume',
        width: 70,
        align: "center",
      },
      {
        title: 'Competition',
        dataIndex: 'competition',
        key: 'competition',
        width: 100,
        align: "center",
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
        dataIndex: 'action',
        key: 'action',
        align: "center",
        render: (_: any, record: any) => {
          return (
            <Space size="small" align='center'>
              <Button
                onClick={() => {
                  topicalMapForm.setFieldValue("search", record.keyword);
                  topicalMapForm.submit();
                }}
              >
                Create map
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  drawers.openBlogPostDrawer({
                    isOpen: true,
                    languageId: record.language_id || "",
                    seedKeyword: record.keyword,
                    headline: record.headline,
                    slug: record.slug,
                  })
                }}
              >
                Write
              </Button>
            </Space>
          )
        },
      },
    ]

  }, []);

  const renderTopicalMapSearchBar = () => {
    return (
      <Form
        form={topicalMapForm}
        initialValues={{
          search: "",
          language_id: selectedLanguage?.id || project?.language_id
        }}
        onFinish={onSubmit}
        disabled={createTopicalMap.isFetching}
      >
        <Flex gap="small">
          <Form.Item noStyle name="language_id">
            <LanguageSelect languages={languages} placeholder="Country" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item noStyle name="search">
            <AutoComplete
              placeholder="Type your keyword"
              allowClear
              style={{ width: 250 }}
            />
          </Form.Item>
          <Button
            disabled={!search || !language_id}
            type="primary"
            htmlType="submit"
            loading={createTopicalMap.isFetching}
            style={{ width: "auto", marginBottom: 0 }}
          >
            Create map
          </Button>
        </Flex>
      </Form>
    )
  }

  return (
    <div className='flex flex-col gap-4'>
      {renderTopicalMapSearchBar()}
      <Spin spinning={createTopicalMap.isFetching} tip="This may take a few seconds...">
        {isEmpty(createTopicalMap.data) ? (
          <Flex align='center' justify='center' style={{ marginTop: 96 }}>
            <Empty
              image="https://usehubrank.com/empty-state/empty-keywords.png"
              imageStyle={{ height: 250 }}
              description={(
                <span className='m-0 text-base'>
                  No topical map created
                </span>
              )}
            />
          </Flex>
        ) : (
          <Table
            size="small"
            virtual
            dataSource={createTopicalMap.data ?? []}
            columns={columns}
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
      </Spin>
    </div>
  )
}

export default TopicalMapTable