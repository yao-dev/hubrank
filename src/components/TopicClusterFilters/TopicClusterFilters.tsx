'use client';
import { useEffect } from "react";
import { TextInput, Flex } from '@mantine/core';
import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";

type Filters = {
  query: string;
}

type Props = {
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

const TopicClusterFilters = ({ onChange }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') ?? '';

  useEffect(() => {
    onChange({ query })
  }, [onChange, query]);

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
        placeholder="Search topics"
        defaultValue={query}
        onChange={(e) => debouncedOnChangeFilter("query", e.target.value)}
        w={225}
      />
    </Flex>
  )
}

export default TopicClusterFilters;