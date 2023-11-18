'use client';;
import { useEffect, useMemo } from "react";
import { TextInput, Flex } from '@mantine/core';
import { useRouter } from "next/navigation";
import { useDebouncedState } from "@mantine/hooks";
import useProjectId from "@/hooks/useProjectId";

type Filters = {
  query: string;
  project_id: number;
}

type Props = {
  onChange: (filters: Filters) => void;
  onClear: () => void;
}

const TopicClusterFilters = ({ onChange, onClear }: Props) => {
  const urlParams = useMemo(() => new URLSearchParams(window?.location?.search || ""), [window?.location])
  const [query, setQuery] = useDebouncedState(urlParams.get('query') ?? '', 400);
  const router = useRouter();
  const activeProjectId = useProjectId();

  useEffect(() => {
    const url = new URL(window.location.href);

    if (!query) {
      url.searchParams.delete('query')
    } else {
      url.searchParams.set("query", query);
    }

    router.replace(url.href, { scroll: false });
    onChange({ query: query || '', project_id: activeProjectId });
  }, [onChange, query])

  return (
    <Flex direction="row" gap="sm">
      <TextInput
        placeholder="Search topic cluster"
        defaultValue={query}
        onChange={(e) => setQuery(e.target.value)}
        w={225}
      />
    </Flex>
  )
}

export default TopicClusterFilters;