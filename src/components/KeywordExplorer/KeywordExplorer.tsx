'use client';
import { useMemo, useState } from "react";
import { chunk } from "lodash";
import { Group, Button, Flex, Text, Table, Pagination, Checkbox, Skeleton } from '@mantine/core';
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const MAX_KEYWORDS = 20

const KeywordExplorer = ({ query, onSubmit, selection = [], countryCode }: { query?: string; onSubmit: any; selection: string[]; countryCode: string }) => {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(selection);
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    enabled: !!query?.length,
    queryKey: ["keywords", query],
    queryFn: () => axios.post('/api/keywords-research', { keyword: query, countryCode })
  });

  const keywords = data?.data?.result || [];

  const splitKeywords = useMemo(() => {
    if (keywords?.length) {
      return chunk(keywords, 25)
    }
    return []
  }, [keywords]);

  const toggleKeyword = (keyword: string) => {
    const tmpKeywords = [...selectedKeywords]
    const idx = tmpKeywords.indexOf(keyword);
    if (idx !== -1) {
      tmpKeywords.splice(idx, 1);
      setSelectedKeywords(tmpKeywords)
    } else if (selectedKeywords.length < MAX_KEYWORDS) {
      tmpKeywords.push(keyword)
      setSelectedKeywords(tmpKeywords)
    }
  }

  return (
    <div>
      <Text size="sm" mt="sm" mb="xl">Select up to <b>{MAX_KEYWORDS} keywords</b>.</Text>
      <Text size="sm" mt="xl" mb="md">{`${keywords.length || 0} keywords found.`}</Text>

      {isLoading ? [...Array(20).keys()].map((_, index) => {
        return <Skeleton key={index} height={25} mb={10} radius="sm" />
      })
        : (
          <>
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
                  const isChecked = selectedKeywords.indexOf(item.keyword) !== -1;
                  const isEnabled = selectedKeywords.length !== MAX_KEYWORDS || keywords.length === MAX_KEYWORDS && isChecked
                  return (
                    <Table.Tr key={item.keyword} onClick={() => toggleKeyword(item.keyword)} style={{
                      cursor: isEnabled ? 'pointer' : 'not-allowed'
                    }}>
                      <Table.Td>
                        <Flex align="center" gap="xs" justify="space-between">
                          <Flex align="center" gap="xs">
                            <Checkbox
                              disabled={!isEnabled}
                              checked={isChecked}
                              onChange={() => toggleKeyword(item.keyword)}
                            />
                            {item.keyword}
                          </Flex>
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
              <Button
                disabled={selectedKeywords.length > MAX_KEYWORDS || selectedKeywords.length <= 0}
                onClick={() => onSubmit(selectedKeywords)}
              >
                Add {selectedKeywords.length} keywords
              </Button>
            </Group>
          </>
        )}
    </div>
  )
}

export default KeywordExplorer