'use client';
import { Button, Flex, Text, Skeleton, Image, Grid, Pagination } from '@mantine/core';
import { IconCheck, IconPlus, IconX } from '@tabler/icons-react';
import { IconTrash } from '@tabler/icons-react';
import { notifications } from "@mantine/notifications";
import { useRouter } from 'next/navigation';
import { modals } from "@mantine/modals";
import AudienceFilters from '../AudienceFilters/AudienceFilters';
import { useCallback, useState } from 'react';
import NewAudienceModal from '../NewAudienceModal/NewAudienceModal';
import useCompetitors from '@/hooks/useCompetitors';

const defaultFilters = {
  query: '',
  page: 1,
}

export default function CompetitorList() {
  const competitors = useCompetitors();
  const { data, isLoading, isError } = competitors.getAll();
  const [filters, setFilters] = useState(defaultFilters)
  const router = useRouter();

  const renderPagination = useCallback(() => {
    return (
      <Pagination value={filters.page} onChange={(page) => setFilters(prev => ({ ...prev, page }))} total={Math.ceil((data?.count || 1) / 25)} />
    )
  }, [filters.page, data?.count]);

  const onDeleteCompetitor = (competitorId: number, name: string) => {
    modals.openConfirmModal({
      title: <Text size="xl" fw="bold">Delete competitor</Text>,
      withCloseButton: false,
      labels: {
        cancel: 'Cancel',
        confirm: 'Confirm'
      },
      async onConfirm() {
        try {
          notifications.show({
            id: 'delete_competitor',
            message: 'Deleting competitor.',
            loading: true,
            withCloseButton: false,
            autoClose: false,
          })
          // await competitors.delete.mutateAsync(competitorId)
          notifications.update({
            id: 'delete_competitor',
            message: 'Competitor deleted.',
            color: 'green',
            loading: false,
            icon: <IconCheck size="1rem" />,
            autoClose: 3000,
          })
        } catch (e) {
          notifications.update({
            id: 'delete_competitor',
            message: 'We couldn\'nt delete the competitor, please try again.',
            color: 'red',
            icon: <IconX size="1rem" />,
            autoClose: 3000,
          })
        }
      },
      confirmProps: {
        color: 'red'
      },
      children: (
        <Text size="sm">Are you sure you want to delete the following competitor <b>{name}</b>?</Text>
      )
    })
  }

  if (isError) {
    return null;
  }

  return (
    <>
      {/* <NewAudienceModal /> */}

      <div>
        <Flex
          // justify="space-between"
          align="center"
          direction="row"
          mb="xl"
          gap="sm"
        >
          <AudienceFilters onChange={setFilters} onClear={() => setFilters(defaultFilters)} />
          {!!data?.data?.length && <Button onClick={() => router.push("?tab=competitors&mode=create")} rightSection={<IconPlus />}>New competitor</Button>}
        </Flex>

        {!isLoading && !data?.data?.length && (
          <Flex direction="column" h={460} justify="center" align="center" gap={50}>
            <Image
              w={500}
              src="/image-2.png"
            />
            <Button onClick={() => router.push("?tab=competitors&mode=create")} rightSection={<IconPlus />}>New competitor</Button>
          </Flex>
        )}

        {isLoading ? [...Array(10).keys()].map((i) => {
          return <Skeleton key={i} height={35} mb={10} radius="sm" />
        }) : data?.data?.map((competitor) => {
          return (
            <Grid key={competitor.id} dir="row" mb="xs">
              <Grid.Col span={3}>
                <Flex direction="row" align="center" gap="md">
                  <Text size="sm">{competitor.name}</Text>
                </Flex>
              </Grid.Col>
              <Grid.Col span={2}>
                <Flex align="center">
                  <Button
                    variant="transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCompetitor(competitor.id, competitor.name)
                    }}
                    color="red"
                    size="xs"
                    style={{
                      padding: '0 2.5px',
                      marginRight: 0
                    }}
                  >
                    <IconTrash size={20} />
                  </Button>
                </Flex>
              </Grid.Col>
            </Grid>
          )
        })}

        <Flex
          justify="end"
          align="center"
          direction="row"
          mt="xl"
          mb="lg"
        >
          {renderPagination()}
        </Flex>
      </div>
    </>
  )
}