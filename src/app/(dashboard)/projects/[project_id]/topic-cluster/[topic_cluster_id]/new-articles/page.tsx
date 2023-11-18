'use client';;
import { useEffect, useMemo, useState } from "react";
import { IconCheck, IconX } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import useArticles from "@/hooks/useArticles";
import { useForm } from "@mantine/form";
import { urlRegex } from "@/constants";
import { chunk, isEmpty } from "lodash";
import useProjectId from "@/hooks/useProjectId";
import useActiveTopicId from "@/hooks/useActiveTopicId";
import useTopicClusters from "@/hooks/useTopicClusters";
import {
  Group,
  Button,
  Flex,
  Text,
  Select,
  Stepper,
  Table,
  Pagination,
  Checkbox,
  Tooltip,
  SegmentedControl,
  Textarea,
  MultiSelect,
  Title,
  LoadingOverlay,
  Badge,
} from '@mantine/core';
import { contentTypes, purposes, tones } from './options';
import { IconInfoCircleFilled } from '@tabler/icons-react';
import MyBreadcrumbs from "@/components/MyBreadcrumbs/MyBreadcrumbs";
import { useRouter } from "next/navigation";

export default function NewArticles() {
  const articles = useArticles();
  const { data: allUsedKeywords } = articles.getAllKeywordsInTopic()
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [step, setStep] = useState(0);
  const activeProjectId = useProjectId();
  const activeTopicId = useActiveTopicId();
  const { data: topic } = useTopicClusters().getOne(activeTopicId);
  const [page, setPage] = useState(0);
  const keywords = useMemo(() => topic?.keywords?.result || [], [topic]);
  const router = useRouter()

  const splitKeywords = useMemo(() => {
    if (keywords.length) {
      return chunk(keywords, 25)
    }
    return []
  }, [keywords]);

  const form = useForm({
    initialValues: {
      max_keywords: 10,
      project_id: activeProjectId,
      topic_cluster_id: activeTopicId.toString(),
      topic_cluster_name: topic?.name,
      keywords: [],
      write_on_save: false,
      articles: []
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: (values) => {
      if (step === 0) {
        return {
          keywords: !values.keywords.length || values.keywords.length > values.max_keywords ? `Select up to ${values.max_keywords} keywords` : null,
        }
      }
      if (step === 1) {
        const articlesValidation = values.articles.map((article) => {
          return {
            content_type: !article?.content_type ? 'Select a content type' : null,
            purpose: !article?.purpose ? 'Select a purpose' : null,
            tones: !article?.tones?.length ? 'Select a tone' : null,
            resource_urls: article?.resource_urls.length && article?.resource_urls.split('\n').some((url: string) => !urlRegex.test(url)) ? 'Please enter valid urls' : null
            // additional_info: article?.additional_info ? 'error' : null
          }
        });

        const allArticlesValid = articlesValidation.map((i) => Object.values(i).every(i => isEmpty(i))).every(i => isEmpty(i))

        if (allArticlesValid) {
          return {}
        }

        return {
          articles: articlesValidation
        }
      }
      return {}
    },
  });

  useEffect(() => {
    form?.validate?.()
  }, [form.values])

  const nextStep = () => {
    const validation = form.validate();

    if (validation.hasErrors) {
      return;
    }
    if (step === 0) {
      return setStep(1)
    }
    if (step === 1) {
      onSubmit()
    }
  }

  const toggleKeyword = (keyword: string) => {
    const tmpKeywords = [...form.values.keywords]
    const idx = tmpKeywords.indexOf(keyword);
    if (idx !== -1) {
      tmpKeywords.splice(idx, 1);
      form.setFieldValue('keywords', tmpKeywords);
      form.removeListItem('articles', idx)
    } else if (form.values.keywords.length < form.values.max_keywords) {
      tmpKeywords.push(keyword)
      form.setFieldValue('keywords', tmpKeywords)
      const foundArticle = form.values.articles.find((article: any) => article?.keyword === keyword);
      if (!foundArticle) {
        form.insertListItem('articles', {
          content_type: '',
          purpose: '',
          tones: [],
          clickbait: 'no',
          keyword,
          resource_urls: '',
          additional_info: '',
        })
      }
    }
  }

  const type = useMemo(() => {
    let value = form.values.write_on_save ? 'article' : 'headline';
    return form.values.keywords.length > 1 ? `${value}s` : value
  }, [form.values.write_on_save, form.values.keywords]);

  const onSubmit = () => {
    const values = form.values;
    setError(false)
    setLoading(true)
    try {
      notifications.show({
        id: 'new_article_ideas',
        // title: `Creating headlines for ${selectedTopic?.name}`,
        title: "Creating headlines",
        message: 'Please wait it can take some times.',
        loading: true,
        withCloseButton: false,
        autoClose: false,
      })
      router.back();
      articles.getArticleIdeas.mutateAsync({
        ...values,
        topic_cluster_name: topic?.name,
      })
        .then(({ data }) => {
          form.reset();
          notifications.update({
            id: 'new_article_ideas',
            message: 'Headlines created.',
            color: 'green',
            loading: false,
            icon: <IconCheck size="1rem" />,
            autoClose: 3000,
          })
        })
        .catch(() => {
          notifications.update({
            id: 'new_article_ideas',
            message: 'Something went wrong during the creation, please try again.',
            color: 'red',
            loading: false,
            icon: <IconX size="1rem" />,
            autoClose: 3000,
          })
          setLoading(false)
          setError(true)
        })
    } catch (e) {
      console.error(e)
      notifications.update({
        id: 'new_article_ideas',
        message: 'Something went wrong during the creation, please try again.',
        color: 'red',
        loading: false,
        icon: <IconX size="1rem" />,
        autoClose: 3000,
      })
      setLoading(false)
      setError(true)
      return;
    }
  }

  return (
    <>
      <Flex direction="row" align="center" justify="space-between" w="auto" gap="sm" mb="lg">
        <MyBreadcrumbs />
      </Flex>

      <Flex direction="row" gap="md" align="center" mb="xl" mt="xl">
        <Title order={2}>New articles</Title>
      </Flex>

      <Stepper size="sm" mt="lg" orientation="horizontal" active={step}>
        <Stepper.Step label="Keyword selection">
          <Text size="sm" mt="sm" mb="xl">Select one keyword per article/headline you want to generate (up to <b>{form.values.max_keywords} keywords</b>).</Text>
          <Text size="sm" mt="xl" mb="md">{`${keywords.length || 0} keywords found.`}</Text>
          <Table highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Keyword</Table.Th>
                <Table.Th ta="center">Search volume</Table.Th>
                <Table.Th ta="center">Competition</Table.Th>
                <Table.Th ta="center">CPC</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {splitKeywords[page]?.map((item) => {
                const isChecked = form.values.keywords.indexOf(item.keyword) !== -1;
                const isEnabled = form.values.keywords.length !== form.values.max_keywords || form.values.keywords.length === form.values.max_keywords && isChecked
                return (
                  <Table.Tr key={item.keyword} onClick={() => toggleKeyword(item.keyword)} style={{
                    cursor: isEnabled ? 'pointer' : 'not-allowed'
                  }}>
                    <Table.Td>
                      <Flex align="center" gap="xs" justify="space-between">
                        <Flex align="center" gap="xs">
                          <Checkbox disabled={!isEnabled} checked={isChecked} onChange={() => toggleKeyword(item.keyword)} /> {item.keyword}
                        </Flex>
                        {allUsedKeywords?.includes(item.keyword) ? <Badge>used</Badge> : ''}
                      </Flex>
                    </Table.Td>
                    <Table.Td ta="center">{item.search_volume}</Table.Td>
                    <Table.Td ta="center">{item.competition}</Table.Td>
                    <Table.Td ta="center">{item.cpc}</Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>

          {splitKeywords.length > 0 && (
            <Group justify='flex-end' mt="md">
              <Pagination value={page + 1} onChange={(value) => setPage(value - 1)} total={splitKeywords.length} />
            </Group>
          )}

          <Group justify='flex-end' mt="xl">
            <Button disabled={form.values.keywords.length > form.values.max_keywords || form.values.keywords.length <= 0} onClick={nextStep} type="submit">Select {form.values.keywords.length} keywords</Button>

            {/* <Button onClick={onSubmit} type="submit" disabled={form.values.keywords.length !== form.values.headline_count}>Generate headlines ({form.values.keywords.length})</Button> */}
            {/* <Group justify='flex-end' mt="md">
                <Button onClick={onSubmit} type="submit">Next</Button>
              </Group> */}
          </Group>
        </Stepper.Step>

        <Stepper.Step label="Writing settings">
          <Table withTableBorder>
            <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />

            <Table.Thead>
              <Table.Tr>
                <Table.Th>Keyword</Table.Th>
                <Table.Th>Content type</Table.Th>
                <Table.Th>Purpose</Table.Th>
                <Table.Th>Tones</Table.Th>
                <Table.Th>Clickbait</Table.Th>
                <Table.Th>
                  <Flex align="center" gap="xs">
                    Url resources
                    <Tooltip
                      multiline
                      w={220}
                      withArrow
                      transitionProps={{ duration: 200 }}
                      label="Please provide the URLs that we will utilize to gather information for our content creation. For instance, include the URL of a competitor's pricing page if you intend to compose a comparative pricing article."
                    >
                      <IconInfoCircleFilled size={20} />
                    </Tooltip>
                  </Flex>
                </Table.Th>
                <Table.Th>Additional info</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {form.values.articles.map((article: any, index: number) => {
                return (
                  <Table.Tr key={article.keyword}>
                    <Table.Td>
                      {article.keyword}
                    </Table.Td>
                    <Table.Td>
                      <Select
                        placeholder="Select a content type"
                        data={contentTypes}
                        maxDropdownHeight={400}
                        searchable
                        {...form.getInputProps(`articles.${index}.content_type`)}
                        error={!!form.errors.articles?.[index]?.content_type}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        placeholder="Select a purpose"
                        data={purposes}
                        maxDropdownHeight={400}
                        searchable
                        {...form.getInputProps(`articles.${index}.purpose`)}
                        error={!!form.errors.articles?.[index]?.purpose}
                      />
                    </Table.Td>
                    <Table.Td>
                      <MultiSelect
                        placeholder="Select tones"
                        data={tones}
                        withAsterisk
                        searchable
                        maxValues={5}
                        hidePickedOptions
                        {...form.getInputProps(`articles.${index}.tones`)}
                        error={!!form.errors.articles?.[index]?.tones}
                      />
                    </Table.Td>
                    <Table.Td>
                      <SegmentedControl
                        transitionDuration={0}
                        defaultValue="no"
                        data={[
                          { label: 'Yes', value: 'yes' },
                          { label: 'No', value: 'no' },
                        ]}
                        {...form.getInputProps(`articles.${index}.clickbait`)}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Textarea
                        placeholder="1 url per line"
                        maxLength={500}
                        autosize
                        maxRows={3}
                        {...form.getInputProps(`articles.${index}.resource_urls`)}
                        error={!!form.errors.articles?.[index]?.resource_urls}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Textarea
                        placeholder="Additional info"
                        maxLength={250}
                        autosize
                        maxRows={3}
                        {...form.getInputProps(`articles.${index}.additional_info`)}
                        error={!!form.errors.articles?.[index]?.additional_info}
                      />
                    </Table.Td>
                  </Table.Tr>
                )
              })}
            </Table.Tbody>
          </Table>

          <Group justify='flex-end' mt="xl">
            <Checkbox
              label="Write on save"
              labelPosition="left"
              {...form.getInputProps('write_on_save')}
            />
          </Group>
          <Group justify='flex-end' mt="md">
            <Button variant="default" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              onClick={nextStep}
              type="submit"
              loading={isLoading}
              disabled={form.values.keywords.length > form.values.max_keywords || isLoading}
            >
              Generate {form.values.keywords.length} {type}
            </Button>
          </Group>
        </Stepper.Step>
      </Stepper>
    </>
  )
}