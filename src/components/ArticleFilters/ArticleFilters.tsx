'use client';
import { TextInput, Flex, Select } from '@mantine/core';
import { useRouter, useSearchParams } from "next/navigation";
import useTopicClusters from "@/hooks/useTopicClusters";
import useActiveProject from "@/hooks/useActiveProject";
import { useEffect } from 'react';
import { debounce } from 'lodash';

// case 'waiting_to_be_written':
//   return 'dark';
// case 'writing_queue':
//   return 'orange';
// case 'writing':
//   return 'blue';
// case 'draft':
//   return 'dark';
// case 'error':
//   return 'red';
// case 'complete':
// case 'published':

const statuses = [
  {
    label: 'Waiting to be written',
    value: 'waiting_to_be_written'
  },
  {
    label: 'Saved for later',
    value: 'saved_for_later'
  },
  {
    label: 'Queue',
    value: 'queue'
  },
  {
    label: 'Writing',
    value: 'writing'
  },
  // {
  //   label: 'Writing sections',
  //   value: 'writing_sections'
  // },
  {
    label: 'Ready to view',
    value: 'ready_to_view'
  },
  {
    label: 'Draft',
    value: 'draft'
  },
  {
    label: 'Completed',
    value: 'completed'
  },
  // {
  //   label: 'Published',
  //   value: 'published'
  // },
  {
    label: 'Error',
    value: 'error'
  },
]

type Filters = {
  query: string;
  status: string;
  topic: string;
}

type Props = {
  onChange: (filters: Filters) => void;
}

const ArticleFilters = ({ onChange }: Props) => {
  const activeProjectId = useActiveProject().id
  const { data } = useTopicClusters().getAll({ project_id: activeProjectId, page: 1 });
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get('query') ?? '';
  const status = searchParams.get('status') ?? '';
  const topic = searchParams.get('topic') ?? '';

  useEffect(() => {
    onChange({
      query,
      status,
      topic,
    })
  }, [onChange, query, status, topic]);

  const onChangeFilter = (name: string, value: string | null) => {
    const url = new URL(window.location.href);
    if (!value) {
      url.searchParams.delete(name)
    } else {
      url.searchParams.set(name, value);
    }
    router.replace(url.href, { scroll: false });
  }

  const debouncedOnChangeFilter = debounce(onChangeFilter, 400)

  return (
    <Flex direction="row" gap="sm">
      <TextInput
        placeholder="Search articles"
        defaultValue={query}
        onChange={(e) => debouncedOnChangeFilter("query", e.target.value)}
        w={225}
      />
      <Select
        placeholder="Status"
        clearable
        defaultValue={status}
        value={status}
        data={statuses?.map(({ label, value }) => ({
          label,
          value
        })) || []}
        onChange={(value) => onChangeFilter("status", value)}
        searchable
      />
      <Select
        placeholder="Topic"
        clearable
        defaultValue={topic}
        value={topic}
        data={data?.data?.map(({ name, id }) => ({
          label: name,
          value: id.toString()
        })) || []}
        onChange={(value) => onChangeFilter("topic", value)}
      />
    </Flex>
  )
}

export default ArticleFilters;