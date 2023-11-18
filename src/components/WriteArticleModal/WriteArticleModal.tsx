import styles from './style.module.css';
import { useEffect, useState } from "react";
import { Modal, Group, Button, LoadingOverlay, Flex, Select, Text, NumberInput, TextInput, Textarea, Checkbox, MultiSelect } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import supabase from "@/helpers/supabase";
import { contentTypes, purposes, tones } from './options';

type WriteArticleModalProps = {
  opened: boolean;
  isLoading: boolean;
  error: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: UseFormReturnType<{
    article_id?: number;
    headline: string;
    purpose: string;
    content_type: string;
    tone: string;
    word_count: number;
    additional_info: string;
    project_id: number;
    topic_cluster_id?: number;
    write_on_save?: boolean;
    tones: string[];
    resource_urls: string[]
  }, (values: {
    article_id?: number;
    headline: string;
    purpose: string;
    content_type: string;
    tone: string;
    word_count: number;
    additional_info: string;
    project_id: number;
    topic_cluster_id?: number;
    write_on_save?: boolean;
    tones: string[];
    resource_urls: string[]
  }) => {
    article_id?: number;
    headline: string;
    purpose: string;
    content_type: string;
    tone: string;
    word_count: number;
    additional_info: string;
    project_id: number;
    topic_cluster_id?: number;
    write_on_save?: boolean;
    tones: string[];
    resource_urls: string[]
  }>,
}

const WriteArticleModal = ({
  opened,
  onClose,
  isLoading,
  onSubmit,
  form,
}: WriteArticleModalProps) => {
  const [topics, setTopics] = useState<any>([]);
  const isExistingArticle = !!form.values.article_id;

  useEffect(() => {
    if (opened) {
      supabase.from('topic_clusters').select().eq('project_id', form.values.project_id).throwOnError()
        .then(({ data }) => {
          setTopics(data);
        })
    }
  }, [opened, form.values.project_id]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      mih={50}
      className={styles.modal}
      trapFocus={false}
    >
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
      <form onSubmit={onSubmit}>
        <Flex gap="lg" direction="column">
          <Text size="xl" fw="bold">{typeof form.values.article_id === 'number' ? 'Edit' : 'New'} article</Text>
          <TextInput
            label="Headline"
            placeholder="Headline"
            withAsterisk
            maxLength={100}
            {...form.getInputProps('headline')}
          />
          <Select
            label="Topic"
            placeholder="Select a topic"
            disabled={isExistingArticle}
            withAsterisk
            data={topics?.map((topic: any) => ({
              label: topic.name,
              value: topic.id.toString()
            })) || []}
            {...form.getInputProps('topic_cluster_id')}
          />
          <Select
            label="Purpose"
            placeholder="Select a purpose"
            data={purposes}
            withAsterisk
            searchable
            {...form.getInputProps('purpose')}
          />
          <Select
            label="Content type"
            placeholder="Select a content type"
            data={contentTypes}
            withAsterisk
            searchable
            {...form.getInputProps('content_type')}
          />
          <MultiSelect
            label="Tones"
            placeholder="Select tones"
            data={tones}
            withAsterisk
            searchable
            {...form.getInputProps('tones')}
          />
          <NumberInput
            defaultValue={500}
            label="Word count"
            placeholder="Word count"
            withAsterisk
            step={250}
            {...form.getInputProps('word_count')}
          />
          <Textarea
            label="Resource urls"
            placeholder="One url per line"
            description="Please provide the URLs that we will utilize to gather information for our content creation. For instance, include the URL of a competitor's pricing page if you intend to compose a comparative pricing article."
            maxLength={500}
            minRows={10}
            maxRows={10}
            {...form.getInputProps('resource_urls')}
          />
          <Textarea
            label="Additional info"
            placeholder="Additional info"
            maxLength={250}
            minRows={3}
            maxRows={3}
            {...form.getInputProps('additional_info')}
          />
          <Group justify='flex-end'>
            <Checkbox
              label="Write on save"
              labelPosition="left"
              {...form.getInputProps('write_on_save')}
            />
          </Group>
          <Group justify='flex-end' mt="md" gap="sm">
            <Button type="submit">Save</Button>
          </Group>
        </Flex>
      </form>
    </Modal>
  )
}

export default WriteArticleModal