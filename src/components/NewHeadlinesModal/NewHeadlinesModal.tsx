import styles from './style.module.css';
import {
  Modal,
  Group,
  Button,
  LoadingOverlay,
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
} from '@mantine/core';
import { contentTypes, purposes } from './options';
import { useEffect, useMemo, useState } from 'react';
import supabase from '@/helpers/supabase';
import { chunk } from 'lodash';
import { IconInfoCircleFilled } from '@tabler/icons-react';
import { tones } from '../WriteArticleModal/options';

type NewHeadlinesModalProps = {
  opened: boolean;
  isLoading: boolean;
  error: boolean;
  onClose: () => void;
  onSubmit: () => void;
  step: number;
  setStep: (step: number) => void;
  // keywords: {
  //   result: any[],
  //   result_count: number;
  // };
  keywords: any[];
  form: any
  // form: UseFormReturnType<{
  //   content_types: string[];
  //   // headline_count: number;
  //   clickbait: 'yes' | 'no' | 'mixed';
  //   logical_order: 'yes' | 'no';
  //   topic_cluster_id?: number;
  //   project_id: number;
  //   topic_cluster_name?: string;
  //   keywords: string[];
  //   write_on_save: boolean;
  // }, (values: {
  //   content_types: string[];
  //   // headline_count: number;
  //   clickbait: 'yes' | 'no' | 'mixed';
  //   logical_order: 'yes' | 'no';
  //   topic_cluster_id?: number;
  //   project_id: number;
  //   topic_cluster_name?: string;
  //   keywords: string[];
  //   write_on_save: boolean;
  // }) => {
  //   content_types: string[];
  //   // headline_count: number;
  //   clickbait: 'yes' | 'no' | 'mixed';
  //   logical_order: 'yes' | 'no';
  //   topic_cluster_id?: number;
  //   project_id: number;
  //   topic_cluster_name?: string;
  //   keywords: string[];
  //   write_on_save: boolean;
  // }>,
}

const NewHeadlinesModal = ({
  opened,
  onClose,
  isLoading,
  onSubmit,
  form,
  step,
  setStep,
  keywords = []
}: NewHeadlinesModalProps) => {
  const [topics, setTopics] = useState<any>([]);
  const [page, setPage] = useState(0);
  const splitKeywords = useMemo(() => {
    if (keywords.length) {
      return chunk(keywords, 25)
    }
    return []
  }, [keywords])

  useEffect(() => {
    if (opened) {
      supabase.from('topic_clusters').select().eq('project_id', form.values.project_id).throwOnError()
        .then(({ data }) => setTopics(data))
    }
  }, [opened, form.values.project_id]);

  useEffect(() => {
    form?.validate?.()
  }, [form.values])

  const nextStep = () => {
    const validation = form.validate()
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

  return (
    <Modal fullScreen opened={opened} onClose={onClose} withCloseButton={false} trapFocus={false} size={!step ? "md" : "xl"} mih={50} className={styles.modal}>
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />

      <Text size="xl" fw="bold">Bulk mode</Text>

      <Stepper size="sm" mt="lg" orientation="horizontal" active={step}>
        <Stepper.Step label="Keyword selection">
          <Text size="sm" mt="sm" mb="xl">Select one keyword per article/headline you want to generate (up to <b>{form.values.max_keywords} keywords</b>).</Text>
          <Text size="sm" mt="xl" mb="md">{`${keywords.length || 0} keywords found.`}</Text>
          <Table.ScrollContainer minWidth={500} h={400}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr className={styles.tr}>
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
                        <Flex align="center" gap="xs">
                          <Checkbox disabled={!isEnabled} checked={isChecked} onChange={() => toggleKeyword(item.keyword)} /> {item.keyword}
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
          </Table.ScrollContainer>

          {splitKeywords.length > 0 && (
            <Group justify='flex-end' mt="md">
              <Pagination value={page + 1} onChange={(value) => setPage(value - 1)} total={splitKeywords.length} />
            </Group>
          )}

          <Group justify='flex-end' mt="xl">
            <Button variant="default" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button disabled={form.values.keywords.length > form.values.max_keywords || form.values.keywords.length <= 0} onClick={nextStep} type="submit">Select {form.values.keywords.length} keywords</Button>

            {/* <Button onClick={onSubmit} type="submit" disabled={form.values.keywords.length !== form.values.headline_count}>Generate headlines ({form.values.keywords.length})</Button> */}
            {/* <Group justify='flex-end' mt="md">
                <Button onClick={onSubmit} type="submit">Next</Button>
              </Group> */}
          </Group>
        </Stepper.Step>

        <Stepper.Step label="Article settings">
          <Table.ScrollContainer minWidth={500} h={500} mt="xl">
            <Table>
              <Table.Thead>
                <Table.Tr className={styles.tr}>
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
                      <Table.Td>{article.keyword}</Table.Td>
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
                          maxValues={2}
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
                          error={!!form.errors.articles?.[index]?.clickbait}
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
          </Table.ScrollContainer>

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
              disabled={form.values.keywords.length > form.values.max_keywords}
            >
              Generate {form.values.keywords.length} {type}
            </Button>
          </Group>
        </Stepper.Step>
      </Stepper>
    </Modal>
  )
}

export default NewHeadlinesModal