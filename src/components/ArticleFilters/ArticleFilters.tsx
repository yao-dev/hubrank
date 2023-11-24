'use client';
import { useEffect, useMemo, useState } from "react";
import { TextInput, Flex, Select } from '@mantine/core';
import { useRouter } from "next/navigation";
import { useDebouncedState } from "@mantine/hooks";

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
}

type Props = {
  onChange: (filters: Filters) => void;
}

const ArticleFilters = ({ onChange }: Props) => {
  const urlParams = useMemo(() => new URLSearchParams(window?.location?.search || ""), [window?.location])
  const [query, setQuery] = useDebouncedState(urlParams.get('query') ?? '', 400);
  const [status, setStatus] = useState(urlParams.get('status') ?? '');
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);

    if (!query) {
      url.searchParams.delete('query')
    } else {
      url.searchParams.set("query", query);
    }

    if (!status) {
      url.searchParams.delete("status");
    } else {
      url.searchParams.set("status", status);
    }

    router.replace(url.href, { scroll: false });
    onChange({
      query: query || '',
      status: status || '',
    })
  }, [onChange, query, status]);

  return (
    <Flex direction="row" gap="sm">
      <TextInput
        placeholder="Search article"
        defaultValue={query}
        onChange={(e) => setQuery(e.target.value)}
        w={225}
      />
      <Select
        placeholder="Status"
        clearable
        data={statuses?.map(({ label, value }) => ({
          label,
          value
        })) || []}
        onChange={(value) => setStatus(value || '')}
        searchable
      />
    </Flex>
  )
}

export default ArticleFilters;